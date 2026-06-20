import type { LoadedPromptFile } from "./LoadedPromptFile.js";

export interface PromptSource {
  loadAllPrompts(): Promise<readonly LoadedPromptFile[]>;
}
