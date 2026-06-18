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
