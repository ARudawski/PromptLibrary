import type { InputMode } from "./InputMode.js";
import type { PromptLifecycle } from "./PromptLifecycle.js";

export interface PromptCommandSummary {
  readonly command: string;
  readonly title: string;
  readonly description: string;
  readonly aliases: readonly string[];
  readonly lifecycle: PromptLifecycle;
  readonly input_mode: InputMode;
}
