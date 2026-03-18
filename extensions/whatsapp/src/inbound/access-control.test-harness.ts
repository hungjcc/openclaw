import { beforeEach, vi } from "vitest";

type AsyncMock<TArgs extends unknown[] = unknown[], TResult = unknown> = {
  (...args: TArgs): Promise<TResult>;
  mockReset: () => AsyncMock<TArgs, TResult>;
  mockResolvedValue: (value: TResult) => AsyncMock<TArgs, TResult>;
  mockResolvedValueOnce: (value: TResult) => AsyncMock<TArgs, TResult>;
};

export const sendMessageMock = vi.fn() as AsyncMock;
export const readAllowFromStoreMock = vi.fn() as AsyncMock;
export const upsertPairingRequestMock = vi.fn() as AsyncMock;

let config: Record<string, unknown> = {};

export function setAccessControlTestConfig(next: Record<string, unknown>): void {
  config = next;
}

export function setupAccessControlTestHarness(): void {
  beforeEach(() => {
    config = {
      channels: {
        whatsapp: {
          dmPolicy: "pairing",
          allowFrom: [],
        },
      },
    };
    sendMessageMock.mockReset().mockResolvedValue(undefined);
    readAllowFromStoreMock.mockReset().mockResolvedValue([]);
    upsertPairingRequestMock.mockReset().mockResolvedValue({ code: "PAIRCODE", created: true });
  });
}

vi.mock("openclaw/plugin-sdk/config-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openclaw/plugin-sdk/config-runtime")>();
  return {
    ...actual,
    loadConfig: () => config,
  };
});

vi.mock("openclaw/plugin-sdk/security-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openclaw/plugin-sdk/security-runtime")>();
  return {
    ...actual,
    readStoreAllowFromForDmPolicy: async (params: {
      provider: string;
      accountId: string;
      dmPolicy?: string | null;
      shouldRead?: boolean | null;
    }) => {
      if (params.shouldRead === false || params.dmPolicy === "allowlist") {
        return [];
      }
      return await readAllowFromStoreMock(params.provider, params.accountId);
    },
  };
});

vi.mock("openclaw/plugin-sdk/conversation-runtime", () => ({
  issuePairingChallenge: async (params: {
    senderId: string;
    senderIdLine: string;
    upsertPairingRequest: (params: {
      id: string;
      meta?: Record<string, string | undefined>;
    }) => Promise<{ code: string; created: boolean }>;
    sendPairingReply: (text: string) => Promise<void>;
    meta?: Record<string, string | undefined>;
  }) => {
    const { code, created } = await params.upsertPairingRequest({
      id: params.senderId,
      meta: params.meta,
    });
    if (!created) {
      return { created: false };
    }
    await params.sendPairingReply(`${params.senderIdLine}\nPairing code: ${code}`);
    return { created: true, code };
  },
  readChannelAllowFromStore: (...args: unknown[]) => readAllowFromStoreMock(...args),
  upsertChannelPairingRequest: (...args: unknown[]) => upsertPairingRequestMock(...args),
}));
