import {
  buildClawApiModelDefinition,
  CLAWAPI_BASE_URL,
  CLAWAPI_MODEL_CATALOG,
} from "../../src/agents/clawapi-models.js";
import type { ModelProviderConfig } from "../../src/config/types.models.js";

export function buildClawApiProvider(): ModelProviderConfig {
  return {
    baseUrl: CLAWAPI_BASE_URL,
    api: "openai-completions",
    models: CLAWAPI_MODEL_CATALOG.map(buildClawApiModelDefinition),
  };
}
