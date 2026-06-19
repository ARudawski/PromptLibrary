import { describe, expect, it } from "vitest";
import { createInvokePromptUseCase } from "../../../src/application/index.js";
import type { PromptDefinition, PromptMetadata } from "../../../src/domain/index.js";
import {
  loadValidatedPromptFixture,
  loadValidatedPromptFixtures,
  promptFixtureFailsDefinitionValidation,
} from "../promptFixtures.js";

describe("InvokePromptUseCase", () => {
  it("invokes an active prompt by slug with the reduced payload", () => {
    const useCase = createUseCaseWithValidFixtures();
    const result = useCase.execute({ command: "active-basic" });

    expect(result).toEqual({
      kind: "success",
      value: {
        title: "Active Basic",
        lifecycle: "one_shot",
        input_mode: "attached_input",
        prompt_body: "Apply the Active Basic fixture prompt to the attached input.\n",
      },
    });
  });

  it("invokes an active prompt by alias", () => {
    const useCase = createUseCaseWithValidFixtures();
    const result = useCase.execute({ command: "alias-basic" });

    expect(result).toMatchObject({
      kind: "success",
      value: {
        title: "Active With Alias",
      },
    });
  });

  it("fails closed for valid draft prompts", () => {
    const useCase = createUseCaseWithValidFixtures();

    expect(useCase.execute({ command: "draft-valid" })).toEqual({
      kind: "failure",
      error: {
        reason: "prompt_not_invokable",
        message: 'Command "draft-valid" is not invokable.',
      },
    });
  });

  it("fails closed for unknown commands with active-only non-executing suggestions", () => {
    const useCase = createUseCaseWithValidFixtures();
    const result = useCase.execute({ command: "active" });

    expect(result).toEqual({
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: 'Command "active" was not found.',
        suggestions: ["active-basic", "active-with-alias"],
      },
    });
    expect(result).not.toHaveProperty("value.prompt_body");
  });

  it("fails closed for collection conflicts without invoking either prompt", () => {
    const useCase = createInvokePromptUseCase(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
      ]),
    );

    expect(useCase.execute({ command: "conflict-target" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_ambiguous",
        message: 'Command "conflict-target" is ambiguous and no prompt was invoked.',
      },
    });
  });

  it("fails closed when an active alias collides with a draft slug", () => {
    const activePrompt = promptWithMetadata(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/active-with-alias.md"),
      {
        aliases: ["draft-valid"],
      },
    );
    const draftPrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md");
    const useCase = createInvokePromptUseCase([activePrompt, draftPrompt]);

    expect(useCase.execute({ command: "draft-valid" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_ambiguous",
        message: 'Command "draft-valid" is ambiguous and no prompt was invoked.',
      },
    });
  });

  it("keeps invalid prompt files outside the invoke index", () => {
    expect(
      promptFixtureFailsDefinitionValidation("test/fixtures/prompts-invalid/invalid-enum.md"),
    ).toBe(true);

    const useCase = createUseCaseWithValidFixtures();

    expect(useCase.execute({ command: "invalid-enum" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: 'Command "invalid-enum" was not found.',
      },
    });
  });
});

function createUseCaseWithValidFixtures() {
  return createInvokePromptUseCase(
    loadValidatedPromptFixtures([
      "test/fixtures/prompts-valid/active-basic.md",
      "test/fixtures/prompts-valid/active-with-alias.md",
      "test/fixtures/prompts-valid/draft-valid.md",
    ]),
  );
}

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
