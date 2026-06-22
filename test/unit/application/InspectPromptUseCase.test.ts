import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createInspectPromptUseCase,
  InspectPromptUseCase,
} from "../../../src/application/index.js";
import type { PromptIndex } from "../../../src/cache/index.js";
import { loadValidatedPromptFixtures } from "../promptFixtures.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("InspectPromptUseCase", () => {
  it("inspects an active prompt by slug with full metadata, body, and inspection flags", () => {
    const useCase = createUseCaseWithValidFixtures();
    const result = useCase.execute({ command: "active-basic" });

    expect(result).toEqual({
      kind: "success",
      value: {
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          schema_version: "1",
          slug: "active-basic",
          title: "Active Basic",
          description: "Basic active fixture prompt.",
          aliases: [],
          lifecycle: "one_shot",
          input_mode: "attached_input",
          status: "active",
        },
        prompt_body: "Apply the Active Basic fixture prompt to the attached input.\n",
      },
    });
  });

  it("inspects an active prompt by alias", () => {
    const useCase = createUseCaseWithValidFixtures();
    const result = useCase.execute({ command: "alias-basic" });

    expect(result).toMatchObject({
      kind: "success",
      value: {
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          slug: "active-with-alias",
        },
        prompt_body: "Use this fixture prompt as a simple alias-backed active command.\n",
      },
    });
  });

  it("fails closed for unknown commands with active-only non-executing suggestions", () => {
    const useCase = createUseCaseWithValidFixtures();

    expect(useCase.execute({ command: "active" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: 'Command "active" was not found.',
        suggestions: ["active-basic", "active-with-alias"],
      },
    });
  });

  it("fails closed for valid draft prompts", () => {
    const useCase = createUseCaseWithValidFixtures();

    expect(useCase.execute({ command: "draft-valid" })).toEqual({
      kind: "failure",
      error: {
        reason: "prompt_not_invokable",
        message: 'Command "draft-valid" is not inspectable.',
      },
    });
  });

  it("fails closed for ambiguous commands without inspecting either prompt", () => {
    const useCase = createInspectPromptUseCase(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
      ]),
    );

    expect(useCase.execute({ command: "conflict-target" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_ambiguous",
        message: 'Command "conflict-target" is ambiguous and no prompt was inspected.',
      },
    });
  });

  it("fails closed for structurally invalid prompt index state", () => {
    const invalidIndex = {
      activeCommands: ["ghost-command"],
      issues: [],
      activeByCommand: new Map(),
      conflictedCommands: new Map(),
      notInvokableCommands: new Set(),
    } satisfies PromptIndex;
    const useCase = new InspectPromptUseCase(invalidIndex);

    expect(useCase.execute({ command: "ghost-command" })).toEqual({
      kind: "failure",
      error: {
        reason: "library_invalid",
        message: "Prompt library index is invalid and no prompt was inspected.",
      },
    });
  });

  it("keeps application, domain, and projection code independent from the MCP SDK", () => {
    const coreFiles = [
      ...tsFilesUnder("src/application"),
      ...tsFilesUnder("src/domain"),
      ...tsFilesUnder("src/projection"),
    ];

    expect(coreFiles.length).toBeGreaterThan(0);

    for (const filePath of coreFiles) {
      expect(readFileSync(filePath, "utf8"), filePath).not.toContain("@modelcontextprotocol/sdk");
    }
  });
});

function createUseCaseWithValidFixtures() {
  return createInspectPromptUseCase(
    loadValidatedPromptFixtures([
      "test/fixtures/prompts-valid/active-basic.md",
      "test/fixtures/prompts-valid/active-with-alias.md",
      "test/fixtures/prompts-valid/draft-valid.md",
    ]),
  );
}

function tsFilesUnder(relativeDirectory: string): readonly string[] {
  const directory = resolve(repoRoot, relativeDirectory);
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...tsFilesUnder(join(relativeDirectory, entry.name)));
      continue;
    }

    if (entry.name.endsWith(".ts")) {
      files.push(entryPath);
    }
  }

  return files;
}
