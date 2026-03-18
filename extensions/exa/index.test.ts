import { describe, expect, it } from "vitest";
import plugin from "./index.js";
import { __testing as exaTesting, createExaWebSearchProvider } from "./src/exa-search-provider.js";

describe("exa plugin", () => {
  it("registers the expected plugin metadata", () => {
    expect(plugin.id).toBe("exa");
    expect(plugin.name).toBe("Exa Plugin");
  });

  it("normalizes Exa results into provider output fields", () => {
    expect(
      exaTesting.normalizeExaResults({
        results: [
          {
            title: "Example result",
            url: "https://example.com/post",
            publishedDate: "2024-01-15T12:00:00.000Z",
            highlights: ["first highlight", "second highlight"],
            text: "fallback text",
          },
        ],
      }),
    ).toEqual([
      {
        title: "Example result",
        url: "https://example.com/post",
        publishedDate: "2024-01-15T12:00:00.000Z",
        highlights: ["first highlight", "second highlight"],
        text: "fallback text",
      },
    ]);
  });

  it("prefers highlights over text when resolving descriptions", () => {
    expect(
      exaTesting.resolveDescription({
        highlights: ["first", "second"],
        text: "fallback",
      }),
    ).toBe("first\nsecond");
    expect(exaTesting.resolveDescription({ text: "fallback" })).toBe("fallback");
  });

  it("supports freshness aliases and ISO date conversion", () => {
    expect(exaTesting.resolveFreshness("pw")).toBe("week");
    expect(exaTesting.resolveFreshness("year")).toBe("year");
    expect(exaTesting.toIsoDateTime("2024-03-10")).toBe("2024-03-10T00:00:00.000Z");
  });
});

describe("exa execute() — strict param validation", () => {
  const TEST_API_KEY = "exa-test-key"; // pragma: allowlist secret

  function makeProvider() {
    return createExaWebSearchProvider().createTool({
      config: undefined,
      searchConfig: { exa: { apiKey: TEST_API_KEY } },
    });
  }

  it("throws on empty query string", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: "", count: 3 })).rejects.toThrow(
      "query must be a non-empty string",
    );
  });

  it("throws on non-string query", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: 123, count: 3 })).rejects.toThrow(
      "query must be a non-empty string",
    );
  });

  it("throws on invalid type value", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: "test query", type: "fuzzy" })).rejects.toThrow(
      'invalid type "fuzzy"',
    );
  });

  it("throws on non-object contents", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: "test query", contents: "yes" })).rejects.toThrow(
      "contents must be an object",
    );
  });

  it("throws on non-boolean contents.highlights", async () => {
    const tool = makeProvider();
    await expect(
      tool!.execute({ query: "test query", contents: { highlights: "yes" } }),
    ).rejects.toThrow("contents.highlights must be a boolean");
  });

  it("throws on unknown contents field", async () => {
    const tool = makeProvider();
    await expect(
      tool!.execute({ query: "test query", contents: { summaries: true } }),
    ).rejects.toThrow('contents has unknown field "summaries"');
  });

  it("throws on invalid date_after format", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: "test query", date_after: "not-a-date" })).rejects.toThrow(
      "not a valid date",
    );
  });

  it("throws on invalid date_before format", async () => {
    const tool = makeProvider();
    await expect(tool!.execute({ query: "test query", date_before: "99-99-9999" })).rejects.toThrow(
      "not a valid date",
    );
  });
});
