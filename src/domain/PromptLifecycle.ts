export const PROMPT_LIFECYCLES = ["persistent_mode", "interactive_workflow", "one_shot"] as const;

export type PromptLifecycle = (typeof PROMPT_LIFECYCLES)[number];
