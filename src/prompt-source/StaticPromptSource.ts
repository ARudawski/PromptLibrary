import type { LoadedPromptFile } from "./LoadedPromptFile.js";
import type { PromptSource } from "./PromptSource.js";

export class StaticPromptSource implements PromptSource {
  readonly #loadedPromptFiles: readonly LoadedPromptFile[];

  public constructor(loadedPromptFiles: readonly LoadedPromptFile[]) {
    this.#loadedPromptFiles = loadedPromptFiles;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    return this.#loadedPromptFiles;
  }
}
