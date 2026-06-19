import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  INPUT_MODES,
  PROMPT_ERROR_REASONS,
  PROMPT_LIFECYCLES,
  PROMPT_STATUSES,
  type PromptDefinition,
  type PromptInvocationPayload,
  type PromptInvocationResult,
} from "../../../src/domain/index.js";
import { type LoadedPromptFixture, PROMPT_FIXTURES } from "../../fixtures/promptFixtureManifest.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("prompt domain vocabulary", () => {
  it("exposes the approved enum values", () => {
    expect(PROMPT_LIFECYCLES).toEqual(["persistent_mode", "interactive_workflow", "one_shot"]);
    expect(INPUT_MODES).toEqual(["attached_input", "conversation_context", "either"]);
    expect(PROMPT_STATUSES).toEqual(["active", "draft"]);
    expect(PROMPT_ERROR_REASONS).toEqual([
      "command_not_found",
      "command_ambiguous",
      "prompt_not_invokable",
      "prompt_invalid",
      "library_invalid",
    ]);
  });

  it("represents metadata separately from the prompt body", () => {
    const definition = {
      metadata: {
        schema_version: "1",
        slug: "active-basic",
        title: "Active Basic",
        description: "Compile-time fixture prompt.",
        aliases: [],
        lifecycle: "one_shot",
        input_mode: "attached_input",
        status: "active",
      },
      promptBody: "Fixture body.",
    } satisfies PromptDefinition;

    expect(definition.metadata.slug).toBe("active-basic");
    expect(definition.promptBody).toBe("Fixture body.");
    expect(definition).not.toHaveProperty("prompt_body");
  });

  it("keeps the invocation payload reduced to model-visible behavior fields", () => {
    const payload = {
      title: "Active Basic",
      lifecycle: "one_shot",
      input_mode: "attached_input",
      prompt_body: "Fixture body.",
    } satisfies PromptInvocationPayload;

    expect(Object.keys(payload).sort()).toEqual([
      "input_mode",
      "lifecycle",
      "prompt_body",
      "title",
    ]);
  });

  it("represents domain failures without MCP transport fields", () => {
    const result = {
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: "No active prompt matched the requested command.",
      },
    } satisfies PromptInvocationResult;

    expect(result.error.reason).toBe("command_not_found");
    expect(result.error).not.toHaveProperty("isError");
    expect(result.error).not.toHaveProperty("no_prompt_invoked");
  });

  it("lists the initial Markdown fixture harness files", () => {
    expect(PROMPT_FIXTURES).toHaveLength(16);

    for (const fixture of PROMPT_FIXTURES) {
      const rawMarkdown = readFileSync(resolve(repoRoot, fixture.relativePath), "utf8");
      const loadedFixture = { ...fixture, rawMarkdown } satisfies LoadedPromptFixture;

      expect(loadedFixture.fileName.endsWith(".md")).toBe(true);
      expect(loadedFixture.rawMarkdown.length).toBeGreaterThan(0);

      if (loadedFixture.fileName !== "missing-frontmatter.md") {
        expect(loadedFixture.rawMarkdown.startsWith("---")).toBe(true);
      }
    }
  });
});
