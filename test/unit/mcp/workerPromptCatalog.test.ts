import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BUNDLED_PROMPT_FILES } from "../../../src/mcp/workerPromptCatalog.generated.js";
import {
  DEFAULT_LOCAL_PROMPTS_DIRECTORY,
  LOCAL_PROMPTS_DOCUMENTATION_FILES,
} from "../../../src/prompt-source/index.js";

describe("Worker bundled prompt catalog", () => {
  it("matches the approved local prompt files", async () => {
    const promptsDirectory = resolve(process.cwd(), DEFAULT_LOCAL_PROMPTS_DIRECTORY);
    const expected = await Promise.all(
      (await readdir(promptsDirectory, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .filter((entry) => !LOCAL_PROMPTS_DOCUMENTATION_FILES.has(entry.name))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right))
        .map(async (fileName) => ({
          sourcePath: `${DEFAULT_LOCAL_PROMPTS_DIRECTORY}/${fileName}`,
          rawMarkdown: await readFile(resolve(promptsDirectory, fileName), "utf8"),
        })),
    );

    expect(BUNDLED_PROMPT_FILES).toEqual(expected);
  });
});
