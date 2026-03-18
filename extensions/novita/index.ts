import { definePluginEntry } from "openclaw/plugin-sdk/core";
import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth";
import { buildSingleProviderApiKeyCatalog } from "openclaw/plugin-sdk/provider-catalog";
import { applyNovitaConfig, NOVITA_DEFAULT_MODEL_REF } from "./onboard.js";
import { buildNovitaProvider } from "./provider-catalog.js";

const PROVIDER_ID = "novita";

export default definePluginEntry({
  id: PROVIDER_ID,
  name: "Novita Provider",
  description: "Bundled Novita AI provider plugin",
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Novita AI",
      docsPath: "/providers/novita",
      envVars: ["NOVITA_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "Novita AI API key",
          hint: "API key",
          optionKey: "novitaApiKey",
          flagName: "--novita-api-key",
          envVar: "NOVITA_API_KEY",
          promptMessage: "Enter Novita AI API key",
          defaultModel: NOVITA_DEFAULT_MODEL_REF,
          expectedProviders: ["novita"],
          applyConfig: (cfg) => applyNovitaConfig(cfg),
          wizard: {
            choiceId: "novita-api-key",
            choiceLabel: "Novita AI API key",
            groupId: "novita",
            groupLabel: "Novita AI",
            groupHint: "API key",
          },
        }),
      ],
      catalog: {
        order: "simple",
        run: (ctx) =>
          buildSingleProviderApiKeyCatalog({
            ctx,
            providerId: PROVIDER_ID,
            buildProvider: buildNovitaProvider,
          }),
      },
    });
  },
});
