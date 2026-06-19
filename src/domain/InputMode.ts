export const INPUT_MODES = ["attached_input", "conversation_context", "either"] as const;

export type InputMode = (typeof INPUT_MODES)[number];
