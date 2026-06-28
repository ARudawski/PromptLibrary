import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DEFAULT_LOCAL_PROMPTS_DIRECTORY,
  LOCAL_PROMPTS_DOCUMENTATION_FILES,
} from "../src/prompt-source/index.js";

const GENERATED_FILE = "src/mcp/workerPromptCatalog.generated.ts";

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const promptsDirectory = resolve(repoRoot, DEFAULT_LOCAL_PROMPTS_DIRECTORY);
  const fileNames = (await readdir(promptsDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .filter((entry) => !LOCAL_PROMPTS_DOCUMENTATION_FILES.has(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const promptFiles = await Promise.all(
    fileNames.map(async (fileName) => ({
      sourcePath: `${DEFAULT_LOCAL_PROMPTS_DIRECTORY}/${fileName}`,
      rawMarkdown: await readFile(resolve(promptsDirectory, fileName), "utf8"),
    })),
  );

  const source = `import type { LoadedPromptFile } from "../prompt-source/index.js";

export const BUNDLED_PROMPT_FILES = ${JSON.stringify(promptFiles, null, 2)} as const satisfies readonly LoadedPromptFile[];
`;

  await writeFile(resolve(repoRoot, GENERATED_FILE), source, "utf8");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
