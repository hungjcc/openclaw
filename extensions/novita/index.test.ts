import { describe, expect, it } from "vitest";
import { registerSingleProviderPlugin } from "../../test/helpers/extensions/plugin-registration.js";
import novitaPlugin from "./index.js";

describe("novita provider plugin", () => {
  it("registers the novita provider with correct metadata", () => {
    const provider = registerSingleProviderPlugin(novitaPlugin);

    expect(provider.id).toBe("novita");
    expect(provider.label).toBe("Novita AI");
    expect(provider.envVars).toEqual(["NOVITA_API_KEY"]);
  });
});
