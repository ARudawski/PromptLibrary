# Prompt Parser

Markdown/frontmatter parsing lives here.

Expected future files:

```text
parsePromptMarkdown.ts
frontmatterSchema.ts
```

Rules:

- parse Markdown files with YAML frontmatter;
- preserve prompt body exactly enough for golden tests;
- do not resolve aliases;
- do not access GitHub/network;
- do not create MCP responses.

## Current ALJ-16 behavior

- `parsePromptMarkdown` requires both opening and closing `---` YAML
  frontmatter delimiters.
- Markdown line endings are normalized to LF before parsing.
- The prompt body removes exactly one LF separator immediately after the closing
  frontmatter delimiter, then preserves the remaining body text, including
  trailing newline content.
- Parsed frontmatter is returned as `unknown`; metadata validation belongs in
  `src/validation/`.
