# Domain Layer

Domain types and invariants live here.

Expected future files:

```text
PromptDefinition.ts
PromptMetadata.ts
PromptLifecycle.ts
InputMode.ts
PromptStatus.ts
PromptErrors.ts
PromptResult.ts
```

Rules:

- no MCP SDK imports;
- no GitHub/network imports;
- no filesystem access;
- prefer discriminated unions for domain results;
- keep lifecycle/input/status enums explicit and allowlisted.
