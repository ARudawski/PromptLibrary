# Validation

Prompt validation lives here.

Expected future files:

```text
validatePromptDefinition.ts
validatePromptCollection.ts
ValidationError.ts
```

Rules:

- validate required frontmatter fields;
- validate lifecycle/input/status enums;
- validate slug and alias allowlists;
- reject empty prompt bodies;
- detect duplicate slugs and alias conflicts;
- never resolve conflicts by file order or priority.
