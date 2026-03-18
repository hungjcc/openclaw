import { execFile } from "node:child_process";
import { platform } from "node:os";

export type PreHookConfig = {
  command: string;
  timeoutSeconds?: number;
};

export type PreHookResult =
  | { outcome: "proceed" }
  | { outcome: "skip"; stdout: string; stderr: string }
  | { outcome: "error"; exitCode: number; stdout: string; stderr: string; message: string };

export const PRE_HOOK_SKIP_EXIT_CODE = 10;
export const DEFAULT_PRE_HOOK_TIMEOUT_SECONDS = 30;
export const MAX_PRE_HOOK_TIMEOUT_SECONDS = 300;
const MAX_OUTPUT_BYTES = 64 * 1024;

export async function runPreHook(
  config: PreHookConfig,
  abortSignal?: AbortSignal,
): Promise<PreHookResult> {
  const timeoutMs =
    Math.min(
      config.timeoutSeconds ?? DEFAULT_PRE_HOOK_TIMEOUT_SECONDS,
      MAX_PRE_HOOK_TIMEOUT_SECONDS,
    ) * 1000;

  const isWindows = platform() === "win32";
  const shell = isWindows ? "cmd.exe" : "/bin/sh";
  const shellArgs = isWindows ? ["/c", config.command] : ["-c", config.command];

  return new Promise<PreHookResult>((resolve) => {
    const child = execFile(
      shell,
      shellArgs,
      { timeout: timeoutMs, maxBuffer: MAX_OUTPUT_BYTES },
      (error, stdout, stderr) => {
        cleanup();

        if (!error) {
          resolve({ outcome: "proceed" });
          return;
        }

        const isMaxBuffer =
          (error as NodeJS.ErrnoException).code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER";

        // When maxBuffer is exceeded the exit code is unavailable from the error
        // object (error.code is the string "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
        // not a numeric exit code, and error.status is absent). Treat as a hard
        // error so that commands that exit 1 or 10 are never silently promoted
        // to "proceed".
        if (isMaxBuffer) {
          resolve({
            outcome: "error",
            exitCode: 1,
            stdout: String(stdout),
            stderr: String(stderr),
            message: "preHook output exceeded maxBuffer (64 KB)",
          });
          return;
        }

        const exitCode =
          typeof error.code === "number"
            ? error.code
            : ((error as NodeJS.ErrnoException & { status?: number }).status ?? 1);

        if (error.killed) {
          const reason = abortSignal?.aborted
            ? "aborted by job timeout"
            : `timed out after ${config.timeoutSeconds ?? DEFAULT_PRE_HOOK_TIMEOUT_SECONDS}s`;
          resolve({
            outcome: "error",
            exitCode,
            stdout: String(stdout),
            stderr: String(stderr),
            message: reason,
          });
          return;
        }

        if (exitCode === PRE_HOOK_SKIP_EXIT_CODE) {
          resolve({
            outcome: "skip",
            stdout: String(stdout),
            stderr: String(stderr),
          });
          return;
        }

        resolve({
          outcome: "error",
          exitCode,
          stdout: String(stdout),
          stderr: String(stderr),
          message: `exited with code ${exitCode}`,
        });
      },
    );

    // Kill child process if the cron job's abort signal fires.
    const onAbort = () => {
      child.kill();
    };
    if (abortSignal) {
      if (abortSignal.aborted) {
        child.kill();
      } else {
        abortSignal.addEventListener("abort", onAbort, { once: true });
      }
    }
    const cleanup = () => {
      abortSignal?.removeEventListener("abort", onAbort);
    };
  });
}
