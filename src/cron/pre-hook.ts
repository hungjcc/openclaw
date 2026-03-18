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

export async function runPreHook(config: PreHookConfig): Promise<PreHookResult> {
  const timeoutMs =
    Math.min(
      config.timeoutSeconds ?? DEFAULT_PRE_HOOK_TIMEOUT_SECONDS,
      MAX_PRE_HOOK_TIMEOUT_SECONDS,
    ) * 1000;

  const isWindows = platform() === "win32";
  const shell = isWindows ? "cmd.exe" : "/bin/sh";
  const shellArgs = isWindows ? ["/c", config.command] : ["-c", config.command];

  return new Promise<PreHookResult>((resolve) => {
    execFile(
      shell,
      shellArgs,
      { timeout: timeoutMs, maxBuffer: MAX_OUTPUT_BYTES },
      (error, stdout, stderr) => {
        if (!error) {
          resolve({ outcome: "proceed" });
          return;
        }

        const exitCode =
          typeof error.code === "number"
            ? error.code
            : ((error as NodeJS.ErrnoException & { status?: number }).status ?? 1);

        if (error.killed) {
          resolve({
            outcome: "error",
            exitCode,
            stdout: String(stdout),
            stderr: String(stderr),
            message: `timed out after ${config.timeoutSeconds ?? DEFAULT_PRE_HOOK_TIMEOUT_SECONDS}s`,
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
  });
}
