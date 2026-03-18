import type { ModelDefinitionConfig } from "../config/types.models.js";

export const NOVITA_BASE_URL = "https://api.novita.ai/openai";

export const NOVITA_MODEL_CATALOG: ModelDefinitionConfig[] = [
  {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 262144,
    maxTokens: 262144,
    cost: {
      input: 0.6,
      output: 3,
      cacheRead: 0.1,
      cacheWrite: 0.6,
    },
  },
  {
    id: "zai-org/glm-5",
    name: "GLM 5",
    reasoning: true,
    input: ["text"],
    contextWindow: 202800,
    maxTokens: 131072,
    cost: {
      input: 1,
      output: 3.2,
      cacheRead: 0.2,
      cacheWrite: 1,
    },
  },
  {
    id: "minimax/minimax-m2.5",
    name: "MiniMax M2.5",
    reasoning: true,
    input: ["text"],
    contextWindow: 204800,
    maxTokens: 131100,
    cost: {
      input: 0.3,
      output: 1.2,
      cacheRead: 0.03,
      cacheWrite: 0.3,
    },
  },
];

export function buildNovitaModelDefinition(
  model: (typeof NOVITA_MODEL_CATALOG)[number],
): ModelDefinitionConfig {
  return {
    id: model.id,
    name: model.name,
    api: "openai-completions",
    reasoning: model.reasoning,
    input: model.input,
    cost: model.cost,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
  };
}
