# Application Layer

Use cases live here.

Expected future files:

```text
InvokePromptUseCase.ts
InspectPromptUseCase.ts
ListPromptsUseCase.ts
```

Rules:

- may orchestrate domain/cache/source/projection behavior;
- must not import MCP SDK types;
- must not parse raw `@pl` text;
- must not perform direct network calls;
- must return typed success/failure results for adapters to map.
