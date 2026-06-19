# Suggestions

Unknown-command suggestion logic lives here.

## Current ALJ-17 behavior

`suggestCommands` uses simple command-text matching against the active command
list supplied by the prompt index.

Implemented behavior:

- suggestions are returned only for unknown commands;
- suggestions are drawn only from active invokable commands;
- suggestions are capped at three commands;
- low-confidence input returns no suggestions;
- suggestions are strings only and never invoke a prompt.

Rules:

- suggestions are optional;
- suggestions may reference only active invokable commands;
- suggestions must never auto-execute;
- failed invocation responses must still include `no_prompt_invoked: true`;
- if confidence is low, return no suggestions.
