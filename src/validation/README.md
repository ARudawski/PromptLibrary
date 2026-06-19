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

## Current ALJ-17 behavior

Collection validation is implemented in `validatePromptCollection` and
`analyzePromptCollection`.

Implemented checks:

- duplicate slugs across the collection fail closed;
- active aliases that conflict with another active prompt slug fail closed;
- duplicate active aliases fail closed, including repeated aliases on one prompt;
- active commands that conflict with draft or status-less prompt commands fail
  closed;
- draft and status-less prompts remain valid authoring data but are excluded from
  active invocation by the prompt index;
- conflict analysis records the involved command and prompt indexes so the index
  can fail closed without choosing a winner.

Collection validation does not parse Markdown, validate frontmatter schema, fetch
sources, or decide MCP response shapes.
