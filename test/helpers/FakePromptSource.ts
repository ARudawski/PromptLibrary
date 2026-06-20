import type { LoadedPromptFile, PromptSource } from "../../src/prompt-source/index.js";

export class FakePromptSource implements PromptSource {
  readonly #promptFiles: readonly LoadedPromptFile[];

  public constructor(promptFiles: readonly LoadedPromptFile[]) {
    this.#promptFiles = promptFiles.map(cloneLoadedPromptFile);
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    return this.#promptFiles.map(cloneLoadedPromptFile);
  }
}

export function fakeLoadedPromptFile(
  options: Readonly<{
    rawMarkdown: string;
    sourcePath?: string;
  }>,
): LoadedPromptFile {
  return {
    sourcePath: options.sourcePath ?? "fake://prompt.md",
    rawMarkdown: options.rawMarkdown,
  };
}

function cloneLoadedPromptFile(promptFile: LoadedPromptFile): LoadedPromptFile {
  return {
    sourcePath: promptFile.sourcePath,
    rawMarkdown: promptFile.rawMarkdown,
  };
}
