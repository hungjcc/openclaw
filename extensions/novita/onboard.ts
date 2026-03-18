import {
  buildNovitaModelDefinition,
  NOVITA_BASE_URL,
  NOVITA_MODEL_CATALOG,
} from "openclaw/plugin-sdk/provider-models";
import {
  applyAgentDefaultModelPrimary,
  applyProviderConfigWithModelCatalog,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/provider-onboard";

export const NOVITA_DEFAULT_MODEL_REF = "novita/moonshotai/kimi-k2.5";

export function applyNovitaProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[NOVITA_DEFAULT_MODEL_REF] = {
    ...models[NOVITA_DEFAULT_MODEL_REF],
    alias: models[NOVITA_DEFAULT_MODEL_REF]?.alias ?? "Novita AI",
  };

  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "novita",
    api: "openai-completions",
    baseUrl: NOVITA_BASE_URL,
    catalogModels: NOVITA_MODEL_CATALOG.map(buildNovitaModelDefinition),
  });
}

export function applyNovitaConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyAgentDefaultModelPrimary(applyNovitaProviderConfig(cfg), NOVITA_DEFAULT_MODEL_REF);
}
