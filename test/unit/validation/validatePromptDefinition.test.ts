import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ParsedPromptMarkdown } from "../../../src/prompt-parser/index.js";
import { parsePromptMarkdown } from "../../../src/prompt-parser/index.js";
import type {
  PromptValidationIssue,
  PromptValidationIssueCode,
} from "../../../src/validation/index.js";
import { validatePromptDefinition } from "../../../src/validation/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("validatePromptDefinition", () => {
  it("accepts valid active and draft prompt definitions", () => {
    const validFixtures = [
      "test/fixtures/prompts-valid/active-basic.md",
      "test/fixtures/prompts-valid/active-with-alias.md",
      "test/fixtures/prompts-valid/draft-valid.md",
    ] as const;

    for (const fixturePath of validFixtures) {
      const result = validatePromptDefinition(parseFixture(fixturePath));

      expect(result.kind).toBe("success");

      if (result.kind !== "success") {
        throw new Error(`Expected ${fixturePath} to validate.`);
      }

      expect(result.prompt.metadata.schema_version).toBe("1");
      expect(result.prompt.promptBody.length).toBeGreaterThan(0);
    }
  });

  it("preserves draft status as valid metadata without deciding invokability", () => {
    const result = validatePromptDefinition(
      parseFixture("test/fixtures/prompts-valid/draft-valid.md"),
    );

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      throw new Error("Expected draft-valid.md to validate.");
    }

    expect(result.prompt.metadata.status).toBe("draft");
  });

  it("allows status to be absent because status is optional metadata", () => {
    const parsedPrompt = parseRawPrompt(`---
schema_version: "1"
slug: status-optional
title: Status Optional
description: Valid fixture without status metadata.
aliases: []
lifecycle: one_shot
input_mode: attached_input
---

This prompt omits status but remains valid metadata.
`);

    const result = validatePromptDefinition(parsedPrompt);

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      throw new Error("Expected prompt without status to validate.");
    }

    expect(result.prompt.metadata).not.toHaveProperty("status");
  });

  it("rejects missing required metadata fields", () => {
    const issues = validateFixtureFailure(
      "test/fixtures/prompts-invalid/missing-required-field.md",
    );

    expectIssue(issues, "missing_required_field", "title");
  });

  it("rejects invalid enum values", () => {
    const issues = validateFixtureFailure("test/fixtures/prompts-invalid/invalid-enum.md");

    expectIssue(issues, "invalid_lifecycle", "lifecycle");
  });

  it("rejects invalid slug format", () => {
    const issues = validateFixtureFailure("test/fixtures/prompts-invalid/invalid-slug.md");

    expectIssue(issues, "invalid_slug", "slug");
  });

  it("rejects invalid alias format", () => {
    const issues = validateFixtureFailure("test/fixtures/prompts-invalid/invalid-alias.md");

    expectIssue(issues, "invalid_alias", "aliases.0");
  });

  it("rejects empty prompt bodies", () => {
    const issues = validateFixtureFailure("test/fixtures/prompts-invalid/empty-body.md");

    expectIssue(issues, "empty_prompt_body", "promptBody");
  });

  it("rejects unknown metadata fields fail-closed", () => {
    const parsedPrompt = parseRawPrompt(`---
schema_version: "1"
slug: unknown-field
title: Unknown Field
description: Invalid fixture with an unknown metadata field.
aliases: []
lifecycle: one_shot
input_mode: attached_input
experimental: true
---

This prompt carries metadata outside the approved schema.
`);

    const result = validatePromptDefinition(parsedPrompt);

    expect(result.kind).toBe("failure");

    if (result.kind !== "failure") {
      throw new Error("Expected unknown metadata field to fail validation.");
    }

    expectIssue(result.issues, "unknown_metadata_field", "experimental");
  });
});

function validateFixtureFailure(relativePath: string): readonly PromptValidationIssue[] {
  const result = validatePromptDefinition(parseFixture(relativePath));

  expect(result.kind).toBe("failure");

  if (result.kind !== "failure") {
    throw new Error(`Expected ${relativePath} to fail validation.`);
  }

  return result.issues;
}

function parseFixture(relativePath: string): ParsedPromptMarkdown {
  return parseRawPrompt(readFileSync(resolve(repoRoot, relativePath), "utf8"));
}

function parseRawPrompt(rawMarkdown: string): ParsedPromptMarkdown {
  const result = parsePromptMarkdown(rawMarkdown);

  expect(result.kind).toBe("success");

  if (result.kind !== "success") {
    throw new Error("Expected prompt to parse before validation.");
  }

  return result.prompt;
}

function expectIssue(
  issues: readonly PromptValidationIssue[],
  code: PromptValidationIssueCode,
  field: string,
): void {
  expect(issues).toContainEqual(expect.objectContaining({ code, field }));
}
