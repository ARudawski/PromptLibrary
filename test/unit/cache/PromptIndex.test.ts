import { describe, expect, it } from "vitest";
import {
  buildPromptIndex,
  isPromptIndexStructurallyValid,
  type PromptIndex,
  resolvePromptCommand,
} from "../../../src/cache/index.js";
import type { PromptDefinition, PromptMetadata } from "../../../src/domain/index.js";
import { loadValidatedPromptFixture, loadValidatedPromptFixtures } from "../promptFixtures.js";

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

  it("fails closed when an active alias collides with a draft slug", () => {
    const activePrompt = promptWithMetadata(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/active-with-alias.md"),
      {
        aliases: ["draft-valid"],
      },
    );
    const draftPrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md");
    const index = buildPromptIndex([activePrompt, draftPrompt]);

    expect(index.activeCommands).toEqual([]);
    expect(resolvePromptCommand(index, "draft-valid")).toMatchObject({
      kind: "conflict",
      command: "draft-valid",
    });
    expect(resolvePromptCommand(index, "active-with-alias")).toMatchObject({
      kind: "conflict",
      command: "active-with-alias",
    });
  });

  it("fails closed when an active slug collides with a draft alias", () => {
    const activePrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/active-basic.md");
    const draftPrompt = promptWithMetadata(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md"),
      {
        aliases: ["active-basic"],
      },
    );
    const index = buildPromptIndex([activePrompt, draftPrompt]);

    expect(index.activeCommands).toEqual([]);
    expect(resolvePromptCommand(index, "active-basic")).toMatchObject({
      kind: "conflict",
      command: "active-basic",
    });
  });

  it("validates prompt index structural invariants", () => {
    const index = buildPromptIndex(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-basic.md",
        "test/fixtures/prompts-valid/active-with-alias.md",
      ]),
    );

    expect(isPromptIndexStructurallyValid(index)).toBe(true);
  });

  it("rejects duplicated active commands in prompt index state", () => {
    const activePrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/active-basic.md");
    const invalidIndex = {
      activeCommands: ["active-basic", "active-basic"],
      issues: [],
      activeByCommand: new Map([["active-basic", activePrompt]]),
      conflictedCommands: new Map(),
      notInvokableCommands: new Set(),
    } satisfies PromptIndex;

    expect(isPromptIndexStructurallyValid(invalidIndex)).toBe(false);
  });

  it("rejects inactive prompts in the active command index", () => {
    const draftPrompt = loadValidatedPromptFixture("test/fixtures/prompts-valid/draft-valid.md");
    const invalidIndex = {
      activeCommands: ["draft-valid"],
      issues: [],
      activeByCommand: new Map([["draft-valid", draftPrompt]]),
      conflictedCommands: new Map(),
      notInvokableCommands: new Set(),
    } satisfies PromptIndex;

    expect(isPromptIndexStructurallyValid(invalidIndex)).toBe(false);
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
