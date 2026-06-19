import type { InputMode } from "./InputMode.js";
import type { PromptLifecycle } from "./PromptLifecycle.js";

export interface PromptInvocationPayload {
  readonly title: string;
  readonly lifecycle: PromptLifecycle;
  readonly input_mode: InputMode;
  readonly prompt_body: string;
}
