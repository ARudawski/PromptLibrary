import type { InputMode } from "./InputMode.js";
import type { PromptLifecycle } from "./PromptLifecycle.js";
import type { PromptStatus } from "./PromptStatus.js";

export interface PromptMetadata {
  readonly schema_version: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly aliases: readonly string[];
  readonly lifecycle: PromptLifecycle;
  readonly input_mode: InputMode;
  readonly status?: PromptStatus;
  readonly tags?: readonly string[];
  readonly notes?: string;
  readonly debug_marker?: string;
  readonly prompt_version?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}
