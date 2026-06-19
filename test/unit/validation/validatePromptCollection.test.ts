import { describe, expect, it } from "vitest";
import type { PromptDefinition, PromptMetadata } from "../../../src/domain/index.js";
import { validatePromptCollection } from "../../../src/validation/index.js";
import { loadValidatedPromptFixture, loadValidatedPromptFixtures } from "../promptFixtures.js";

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

  it("fails closed when an active alias equals a draft slug", () => {
    const activePrompt = promptWithMetadata(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/active-with-alias.md"),
      {
        aliases: ["draft-valid"],
      },
    );
    const draftPrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md");

    const result = validatePromptCollection([activePrompt, draftPrompt]);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "active_not_invokable_command_conflict",
        command: "draft-valid",
      }),
    );
  });

  it("fails closed when an active slug equals a draft alias", () => {
    const activePrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/active-basic.md");
    const draftPrompt = promptWithMetadata(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md"),
      {
        aliases: ["active-basic"],
      },
    );

    const result = validatePromptCollection([activePrompt, draftPrompt]);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "active_not_invokable_command_conflict",
        command: "active-basic",
      }),
    );
  });

  it("fails closed when an active command equals a status-less prompt command", () => {
    const activePrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/active-basic.md");
    const statuslessPrompt: PromptDefinition = {
      metadata: {
        schema_version: "1",
        slug: "statusless-prompt",
        title: "Statusless Prompt",
        description: "Valid metadata without status that must not become invokable.",
        aliases: ["active-basic"],
        lifecycle: "one_shot",
        input_mode: "attached_input",
      },
      promptBody: "This status-less prompt remains valid authoring data only.\n",
    };

    const result = validatePromptCollection([activePrompt, statuslessPrompt]);

    expect(result.kind).toBe("failure");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "active_not_invokable_command_conflict",
        command: "active-basic",
      }),
    );
  });
});

function promptWithMetadata(
  prompt: PromptDefinition,
  metadata: Partial<PromptMetadata>,
): PromptDefinition {
  return {
    metadata: {
      ...prompt.metadata,
      ...metadata,
    },
    promptBody: prompt.promptBody,
  };
}
