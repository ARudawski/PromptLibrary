# Suggestions

Unknown-command suggestion logic lives here.

Rules:

- suggestions are optional;
- suggestions may reference only active invokable commands;
- suggestions must never auto-execute;
- failed invocation responses must still include `no_prompt_invoked: true`;
- if confidence is low, return no suggestions.
