# Application Layer

Use cases live here.

Current files:

```text
createFixtureBackedInvokePromptUseCase.ts
InvokePromptUseCase.ts
```

Expected future files:

```text
InspectPromptUseCase.ts
ListPromptsUseCase.ts
```

## Current ALJ-17 behavior

`InvokePromptUseCase` accepts an explicit tool command string and resolves it
through the derived prompt index.

Implemented behavior:

- active slug invocation returns the reduced invocation payload;
- active alias invocation returns the same reduced invocation payload;
- draft and status-less prompts fail closed as not invokable;
- conflicted commands fail closed as ambiguous;
- unknown commands fail closed and may include active-only non-executing
  suggestions;
- invalid prompt files must fail definition validation before they reach the use
  case.

Rules:

- may orchestrate domain/cache/source/projection behavior;
- must not import MCP SDK types;
- must not parse raw `@pl` text;
- must not perform direct network calls;
- must return typed success/failure results for adapters to map.

## Current ALJ-18 behavior

`createFixtureBackedInvokePromptUseCase` composes the local fixture source,
Markdown parser, prompt definition validator, and `InvokePromptUseCase` for the
Slice 1 MCP adapter.

Invalid or unparsable fixture files do not enter the use-case index. Collection
conflicts are still handled by the derived prompt index and fail closed at
invocation time.
