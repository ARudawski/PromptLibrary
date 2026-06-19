import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parsePromptMarkdown } from "../../../src/prompt-parser/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("parsePromptMarkdown", () => {
  it("parses YAML frontmatter and preserves the normalized prompt body", () => {
    const rawMarkdown = readFixture("test/fixtures/prompts-valid/active-basic.md");
    const result = parsePromptMarkdown(rawMarkdown);

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      throw new Error("Expected active-basic.md to parse.");
    }

    expect(result.prompt.metadata).toMatchObject({
      schema_version: "1",
      slug: "active-basic",
      title: "Active Basic",
    });
    expect(result.prompt.promptBody).toBe(
      "Apply the Active Basic fixture prompt to the attached input.\n",
    );
  });

  it("normalizes CRLF line endings and removes only the frontmatter separator newline", () => {
    const rawMarkdown = [
      "---",
      'schema_version: "1"',
      "slug: crlf-normalization",
      "title: CRLF Normalization",
      "description: Fixture with CRLF line endings.",
      "aliases: []",
      "lifecycle: one_shot",
      "input_mode: attached_input",
      "status: active",
      "---",
      "",
      "First body line.",
      "",
      "Second body line.",
      "",
    ].join("\r\n");

    const result = parsePromptMarkdown(rawMarkdown);

    expect(result.kind).toBe("success");

    if (result.kind !== "success") {
      throw new Error("Expected CRLF prompt to parse.");
    }

    expect(result.prompt.promptBody).toBe("First body line.\n\nSecond body line.\n");
  });

  it("fails closed when frontmatter delimiters are missing", () => {
    const rawMarkdown = readFixture("test/fixtures/prompts-invalid/missing-frontmatter.md");
    const result = parsePromptMarkdown(rawMarkdown);

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        reason: "missing_frontmatter",
      },
    });
  });

  it("fails closed when the closing frontmatter delimiter is missing", () => {
    const result = parsePromptMarkdown(`---
schema_version: "1"
slug: missing-closing-delimiter
title: Missing Closing Delimiter
description: Invalid fixture without a closing delimiter.
aliases: []
lifecycle: one_shot
input_mode: attached_input
status: active
`);

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        reason: "missing_frontmatter",
      },
    });
  });

  it("fails closed when YAML frontmatter is malformed", () => {
    const rawMarkdown = readFixture("test/fixtures/prompts-invalid/malformed-frontmatter.md");
    const result = parsePromptMarkdown(rawMarkdown);

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        reason: "malformed_frontmatter",
      },
    });
  });
});

function readFixture(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}
