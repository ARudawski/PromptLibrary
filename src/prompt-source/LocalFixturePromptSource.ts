import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { LoadedPromptFile } from "./LoadedPromptFile.js";
import type { PromptSource } from "./PromptSource.js";

export const DEFAULT_FIXTURE_PROMPT_PATHS = [
  "test/fixtures/prompts-valid/active-basic.md",
  "test/fixtures/prompts-valid/active-with-alias.md",
  "test/fixtures/prompts-valid/draft-valid.md",
] as const;

export interface LocalFixturePromptSourceOptions {
  readonly repoRoot?: string;
  readonly promptPaths?: readonly string[];
}

export class LocalFixturePromptSource implements PromptSource {
  readonly #repoRoot: string;
  readonly #promptPaths: readonly string[];

  public constructor(options: LocalFixturePromptSourceOptions = {}) {
    this.#repoRoot = options.repoRoot ?? defaultRepoRoot();
    this.#promptPaths = options.promptPaths ?? DEFAULT_FIXTURE_PROMPT_PATHS;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    return Promise.all(
      this.#promptPaths.map(async (promptPath) => ({
        sourcePath: promptPath,
        rawMarkdown: await readFile(resolve(this.#repoRoot, promptPath), "utf8"),
      })),
    );
  }
}

function defaultRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
}
