export const PROMPT_STATUSES = ["active", "draft"] as const;

export type PromptStatus = (typeof PROMPT_STATUSES)[number];
