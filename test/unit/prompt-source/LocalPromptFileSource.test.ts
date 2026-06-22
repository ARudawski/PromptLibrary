import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LocalPromptFileSource } from "../../../src/prompt-source/index.js";

describe("LocalPromptFileSource", () => {
  it("loads local prompt Markdown files from prompts/*.md and ignores README.md", async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), "prompt-library-local-source-"));
    await mkdir(join(repoRoot, "prompts"));
    await writeFile(join(repoRoot, "prompts", "README.md"), "# Prompt docs\n", "utf8");
    await writeFile(join(repoRoot, "prompts", "alpha.md"), "alpha prompt\n", "utf8");
    await writeFile(join(repoRoot, "prompts", "beta.md"), "beta prompt\n", "utf8");
    await writeFile(join(repoRoot, "prompts", "notes.txt"), "not markdown\n", "utf8");

    const source = new LocalPromptFileSource({ repoRoot });

    await expect(source.loadAllPrompts()).resolves.toEqual([
      {
        sourcePath: join("prompts", "alpha.md"),
        rawMarkdown: "alpha prompt\n",
      },
      {
        sourcePath: join("prompts", "beta.md"),
        rawMarkdown: "beta prompt\n",
      },
    ]);
  });

  it("treats a missing prompts directory as an empty local source", async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), "prompt-library-empty-source-"));
    const source = new LocalPromptFileSource({ repoRoot });

    await expect(source.loadAllPrompts()).resolves.toEqual([]);
  });
});
