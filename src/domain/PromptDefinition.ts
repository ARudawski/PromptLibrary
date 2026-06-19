import type { PromptMetadata } from "./PromptMetadata.js";

export interface PromptDefinition {
  readonly metadata: PromptMetadata;
  readonly promptBody: string;
}
