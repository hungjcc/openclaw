---
title: "Novita AI"
summary: "Novita AI setup (auth + model selection)"
read_when:
  - You want to use Novita AI with OpenClaw
  - You need the API key env var or CLI auth choice
---

# Novita AI

[Novita AI](https://novita.ai) provides access to leading open-source models including Kimi K2.5, GLM 5, and MiniMax M2.5 through an OpenAI-compatible API.

- Provider: `novita`
- Auth: `NOVITA_API_KEY`
- API: OpenAI-compatible

## Quick start

1. Set the API key (recommended: store it for the Gateway):

```bash
openclaw onboard --auth-choice novita-api-key
```

2. Set a default model:

```json5
{
  agents: {
    defaults: {
      model: { primary: "novita/moonshotai/kimi-k2.5" },
    },
  },
}
```

## Non-interactive example

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice novita-api-key \
  --novita-api-key "$NOVITA_API_KEY"
```

This will set `novita/moonshotai/kimi-k2.5` as the default model.

## Environment note

If the Gateway runs as a daemon (launchd/systemd), make sure `NOVITA_API_KEY`
is available to that process (for example, in `~/.openclaw/.env` or via
`env.shellEnv`).

## Available models

- **Kimi K2.5** (`moonshotai/kimi-k2.5`) - Reasoning model with 262K context window, supports text and image input
- **GLM 5** (`zai-org/glm-5`) - Reasoning model with 202K context window
- **MiniMax M2.5** (`minimax/minimax-m2.5`) - Reasoning model with 204K context window

All models support standard chat completions and are OpenAI API compatible.
