import type { PromptMetadata } from "./PromptMetadata.js";

export interface PromptInspection {
  readonly ok: true;
  readonly type: "prompt_inspection";
  readonly inspection_only: true;
  readonly no_prompt_invoked: true;
  readonly metadata: PromptMetadata;
  readonly prompt_body: string;
}
