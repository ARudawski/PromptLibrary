import { describe, expect, it } from "vitest";
import { validatePromptCollection } from "../../../src/validation/index.js";
import { loadValidatedPromptFixtures } from "../promptFixtures.js";

describe("validatePromptCollection", () => {
  it("accepts valid active and draft prompts without deciding draft invokability", () => {
    const prompts = loadValidatedPromptFixtures([
      "test/fixtures/prompts-valid/active-basic.md",
      "test/fixtures/prompts-valid/active-with-alias.md",
      "test/fixtures/prompts-valid/draft-valid.md",
    ]);

    expect(validatePromptCollection(prompts)).toEqual({
      kind: "success",
      issues: [],
    });
  });

  it("fails closed for duplicate slugs", () => {
    const prompts = loadValidatedPromptFixtures([
      "test/fixtures/prompts-conflicts/duplicate-slug-a.md",
      "test/fixtures/prompts-conflicts/duplicate-slug-b.md",
    ]);

    const result = validatePromptCollection(prompts);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "duplicate_slug",
        command: "duplicate-slug",
      }),
    );
  });

  it("fails closed for an active alias that conflicts with an active slug", () => {
    const prompts = loadValidatedPromptFixtures([
      "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
      "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
    ]);

    const result = validatePromptCollection(prompts);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "alias_conflicts_with_slug",
        command: "conflict-target",
      }),
    );
  });

  it("fails closed for duplicate active aliases", () => {
    const prompts = loadValidatedPromptFixtures([
      "test/fixtures/prompts-conflicts/duplicate-alias-a.md",
      "test/fixtures/prompts-conflicts/duplicate-alias-b.md",
    ]);

    const result = validatePromptCollection(prompts);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "duplicate_alias",
        command: "shared-alias",
      }),
    );
  });
});
