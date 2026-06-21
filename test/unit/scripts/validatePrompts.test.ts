import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { formatValidationReport, validateLocalPrompts } from "../../../scripts/validate-prompts.js";

const temporaryRoots: string[] = [];

describe("validate-prompts script", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots
        .splice(0)
        .map((rootDirectory) => rm(rootDirectory, { recursive: true, force: true })),
    );
  });

  it("passes valid local prompt files and reports drafts separately", async () => {
    const rootDirectory = await createPromptWorkspace({
      "active.md": promptMarkdown({
        slug: "active-command",
        title: "Active Command",
        aliases: ["active-alias"],
        status: "active",
      }),
      "draft.md": promptMarkdown({
        slug: "draft-command",
        title: "Draft Command",
        aliases: [],
        status: "draft",
      }),
    });

    const result = await validateLocalPrompts({ rootDirectory });
    const report = formatValidationReport(result);

    expect(result.ok).toBe(true);
    expect(result.activePrompts.map(({ prompt }) => prompt.metadata.slug)).toEqual([
      "active-command",
    ]);
    expect(result.draftPrompts.map(({ prompt }) => prompt.metadata.slug)).toEqual([
      "draft-command",
    ]);
    expect(report).toContain("validate-prompts: OK");
    expect(report).toContain("drafts: 1");
    expect(report).toContain("draft prompts:");
    expect(report).toContain("draft-command");
  });

  it("passes an empty or missing prompts directory for early repo gates", async () => {
    const rootDirectory = await createTemporaryRoot();

    const result = await validateLocalPrompts({ rootDirectory });

    expect(result.ok).toBe(true);
    expect(result.files).toEqual([]);
    expect(formatValidationReport(result)).toContain("no local prompt Markdown files found");
  });

  it("fails non-zero-equivalent validation for invalid prompt files", async () => {
    const rootDirectory = await createPromptWorkspace({
      "invalid-active.md": `---
schema_version: "1"
slug: invalid-active
description: Missing title should fail schema validation.
aliases: []
lifecycle: one_shot
input_mode: attached_input
status: active
---

This prompt has active status but invalid metadata.
`,
    });

    const result = await validateLocalPrompts({ rootDirectory });
    const report = formatValidationReport(result);

    expect(result.ok).toBe(false);
    expect(result.invalidFiles).toHaveLength(1);
    expect(report).toContain("validate-prompts: FAILED");
    expect(report).toContain("invalid files:");
    expect(report).toContain("missing_required_field");
  });

  it("fails when active command aliases conflict with active slugs", async () => {
    const rootDirectory = await createPromptWorkspace({
      "target.md": promptMarkdown({
        slug: "conflict-target",
        title: "Conflict Target",
        aliases: [],
        status: "active",
      }),
      "source.md": promptMarkdown({
        slug: "conflict-source",
        title: "Conflict Source",
        aliases: ["conflict-target"],
        status: "active",
      }),
    });

    const result = await validateLocalPrompts({ rootDirectory });
    const report = formatValidationReport(result);

    expect(result.ok).toBe(false);
    expect(result.collectionIssues).toContainEqual(
      expect.objectContaining({
        code: "alias_conflicts_with_slug",
        command: "conflict-target",
      }),
    );
    expect(report).toContain("collection issues:");
    expect(report).toContain("alias_conflicts_with_slug conflict-target");
  });
});

async function createPromptWorkspace(files: Record<string, string>): Promise<string> {
  const rootDirectory = await createTemporaryRoot();
  const promptsDirectory = join(rootDirectory, "prompts");
  await mkdir(promptsDirectory);

  await Promise.all(
    Object.entries(files).map(([fileName, contents]) =>
      writeFile(join(promptsDirectory, fileName), contents, "utf8"),
    ),
  );

  return rootDirectory;
}

async function createTemporaryRoot(): Promise<string> {
  const rootDirectory = await mkdtemp(join(tmpdir(), "ppl-validate-prompts-"));
  temporaryRoots.push(rootDirectory);
  return rootDirectory;
}

interface PromptMarkdownInput {
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly status: "active" | "draft";
}

function promptMarkdown(input: PromptMarkdownInput): string {
  const aliases =
    input.aliases.length === 0
      ? "aliases: []"
      : ["aliases:", ...input.aliases.map((alias) => `  - ${alias}`)].join("\n");

  return `---
schema_version: "1"
slug: ${input.slug}
title: ${input.title}
description: Test prompt for validate-prompts.
${aliases}
lifecycle: one_shot
input_mode: attached_input
status: ${input.status}
---

Use this prompt for local validate-prompts testing.
`;
}
