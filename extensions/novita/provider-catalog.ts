import {
  buildNovitaModelDefinition,
  type ModelProviderConfig,
  NOVITA_BASE_URL,
  NOVITA_MODEL_CATALOG,
} from "openclaw/plugin-sdk/provider-models";

export function buildNovitaProvider(): ModelProviderConfig {
  return {
    baseUrl: NOVITA_BASE_URL,
    api: "openai-completions",
    models: NOVITA_MODEL_CATALOG.map(buildNovitaModelDefinition),
  };
}
