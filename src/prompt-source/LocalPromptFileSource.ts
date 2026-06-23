import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { LoadedPromptFile } from "./LoadedPromptFile.js";
import type { PromptSource } from "./PromptSource.js";

export const DEFAULT_LOCAL_PROMPTS_DIRECTORY = "prompts";
export const LOCAL_PROMPTS_DOCUMENTATION_FILES = new Set(["README.md"]);

export interface LocalPromptFileSourceOptions {
  readonly repoRoot?: string;
  readonly promptsDirectory?: string;
}

export class LocalPromptFileSource implements PromptSource {
  readonly #repoRoot: string;
  readonly #promptsDirectory: string;

  public constructor(options: LocalPromptFileSourceOptions = {}) {
    this.#repoRoot = options.repoRoot ?? defaultRepoRoot();
    this.#promptsDirectory = options.promptsDirectory ?? DEFAULT_LOCAL_PROMPTS_DIRECTORY;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    const promptsDirectory = resolve(this.#repoRoot, this.#promptsDirectory);
    let directoryEntries: readonly LocalPromptDirectoryEntry[];

    try {
      directoryEntries = await readdir(promptsDirectory, { withFileTypes: true });
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }

    const markdownFileNames = directoryEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .filter((entry) => !LOCAL_PROMPTS_DOCUMENTATION_FILES.has(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    return Promise.all(
      markdownFileNames.map(async (fileName) => {
        const promptPath = join(promptsDirectory, fileName);

        return {
          sourcePath: relative(this.#repoRoot, promptPath),
          rawMarkdown: await readFile(promptPath, "utf8"),
        };
      }),
    );
  }
}

interface LocalPromptDirectoryEntry {
  readonly name: string;
  isFile(): boolean;
}

function defaultRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
