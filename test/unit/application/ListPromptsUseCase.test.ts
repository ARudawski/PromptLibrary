import { describe, expect, it } from "vitest";
import { createListPromptsUseCase, ListPromptsUseCase } from "../../../src/application/index.js";
import type { PromptIndex } from "../../../src/cache/index.js";
import {
  loadValidatedPromptFixtures,
  promptFixtureFailsDefinitionValidation,
} from "../promptFixtures.js";

describe("ListPromptsUseCase", () => {
  it("lists active prompt summaries once by canonical command with deterministic sorting", () => {
    const useCase = createListPromptsUseCase(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-with-alias.md",
        "test/fixtures/prompts-valid/draft-valid.md",
        "test/fixtures/prompts-valid/active-basic.md",
      ]),
    );

    const result = useCase.execute();

    expect(result).toEqual({
      kind: "success",
      value: [
        {
          command: "active-basic",
          title: "Active Basic",
          description: "Basic active fixture prompt.",
          aliases: [],
          lifecycle: "one_shot",
          input_mode: "attached_input",
        },
        {
          command: "active-with-alias",
          title: "Active With Alias",
          description: "Active fixture prompt with a command alias.",
          aliases: ["alias-basic"],
          lifecycle: "interactive_workflow",
          input_mode: "either",
        },
      ],
    });
  });

  it("keeps aliases as metadata instead of duplicate command entries", () => {
    const result = createListPromptsUseCase(
      loadValidatedPromptFixtures(["test/fixtures/prompts-valid/active-with-alias.md"]),
    ).execute();

    expect(result).toMatchObject({
      kind: "success",
      value: [
        {
          command: "active-with-alias",
          aliases: ["alias-basic"],
        },
      ],
    });

    if (result.kind !== "success") {
      throw new Error("Expected list use case to succeed.");
    }

    expect(result.value).toHaveLength(1);
    expect(result.value.map((summary) => summary.command)).not.toContain("alias-basic");
  });

  it("excludes drafts, conflicted commands, invalid fixtures, prompt bodies, and operational metadata", () => {
    expect(
      promptFixtureFailsDefinitionValidation("test/fixtures/prompts-invalid/invalid-enum.md"),
    ).toBe(true);

    const result = createListPromptsUseCase(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-basic.md",
        "test/fixtures/prompts-valid/draft-valid.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
      ]),
    ).execute();

    expect(result).toEqual({
      kind: "success",
      value: [
        {
          command: "active-basic",
          title: "Active Basic",
          description: "Basic active fixture prompt.",
          aliases: [],
          lifecycle: "one_shot",
          input_mode: "attached_input",
        },
      ],
    });

    if (result.kind !== "success") {
      throw new Error("Expected list use case to succeed.");
    }

    for (const summary of result.value) {
      expect(summary).not.toHaveProperty("prompt_body");
      expect(summary).not.toHaveProperty("status");
      expect(summary).not.toHaveProperty("schema_version");
      expect(summary).not.toHaveProperty("source_path");
      expect(summary).not.toHaveProperty("repo_commit");
      expect(summary).not.toHaveProperty("indexed_at");
      expect(summary).not.toHaveProperty("validation_diagnostics");
      expect(summary).not.toHaveProperty("cache_diagnostics");
    }

    expect(result.value.map((summary) => summary.command)).not.toContain("draft-valid");
    expect(result.value.map((summary) => summary.command)).not.toContain("conflict-target");
    expect(result.value.map((summary) => summary.command)).not.toContain(
      "alias-slug-conflict-source",
    );
    expect(result.value.map((summary) => summary.command)).not.toContain("invalid-enum");
  });

  it("fails closed for structurally invalid prompt index state", () => {
    const invalidIndex = {
      activeCommands: ["ghost-command"],
      issues: [],
      activeByCommand: new Map(),
      conflictedCommands: new Map(),
      notInvokableCommands: new Set(),
    } satisfies PromptIndex;
    const useCase = new ListPromptsUseCase(invalidIndex);

    expect(useCase.execute()).toEqual({
      kind: "failure",
      error: {
        reason: "library_invalid",
        message: "Prompt library index is invalid and no prompt summaries were listed.",
      },
    });
  });
});
