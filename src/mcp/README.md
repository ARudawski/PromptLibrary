# MCP Adapter Layer

ChatGPT Apps / MCP transport code lives here.

Expected future structure:

```text
server.ts
tools/
  invokePromptLibraryCommandTool.ts
  inspectPromptLibraryCommandTool.ts
  listPromptLibraryCommandsTool.ts
schemas/
  toolInputSchemas.ts
  toolOutputSchemas.ts
```

Rules:

- register tools;
- validate tool I/O;
- map application use-case results to MCP-native `structuredContent` and `content`;
- keep receipt text compact;
- do not fetch GitHub;
- do not parse Markdown;
- do not resolve aliases directly;
- do not implement business logic here.
