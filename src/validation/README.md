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

## Current ALJ-16 behavior

Single-prompt validation is implemented in `validatePromptDefinition`.

Implemented checks:

- required fields: `schema_version`, `slug`, `title`, `description`, `aliases`,
  `lifecycle`, and `input_mode`;
- optional fields allowed by the current schema: `status`, `tags`, `notes`,
  `debug_marker`, `prompt_version`, `created_at`, and `updated_at`;
- strict metadata schema; unknown frontmatter fields fail closed;
- lifecycle/input/status enum allowlists;
- lowercase kebab-case slug and alias format;
- non-empty prompt body after trimming whitespace.

Draft status is valid metadata but does not imply invokability. Collection-level
slug/alias conflict validation remains out of scope for ALJ-16.
