import { describe, expect, it } from "vitest";
import { buildPromptIndex, resolvePromptCommand } from "../../../src/cache/index.js";
import { loadValidatedPromptFixtures } from "../promptFixtures.js";

describe("PromptIndex", () => {
  it("indexes active prompts by slug and alias", () => {
    const index = buildPromptIndex(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-basic.md",
        "test/fixtures/prompts-valid/active-with-alias.md",
      ]),
    );

    expect(resolvePromptCommand(index, "active-basic")).toMatchObject({
      kind: "found",
      prompt: {
        metadata: {
          slug: "active-basic",
        },
      },
    });
    expect(resolvePromptCommand(index, "alias-basic")).toMatchObject({
      kind: "found",
      prompt: {
        metadata: {
          slug: "active-with-alias",
        },
      },
    });
  });

  it("excludes valid draft prompts from the active index", () => {
    const index = buildPromptIndex(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-basic.md",
        "test/fixtures/prompts-valid/draft-valid.md",
      ]),
    );

    expect(index.activeCommands).toEqual(["active-basic"]);
    expect(resolvePromptCommand(index, "draft-valid")).toEqual({
      kind: "not_invokable",
      command: "draft-valid",
    });
  });

  it("records conflicting commands without choosing by file order", () => {
    const index = buildPromptIndex(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-conflicts/duplicate-alias-a.md",
        "test/fixtures/prompts-conflicts/duplicate-alias-b.md",
      ]),
    );

    expect(index.activeCommands).toEqual([]);
    expect(resolvePromptCommand(index, "shared-alias")).toMatchObject({
      kind: "conflict",
      command: "shared-alias",
    });
    expect(resolvePromptCommand(index, "duplicate-alias-a")).toMatchObject({
      kind: "conflict",
      command: "duplicate-alias-a",
    });
  });
});
