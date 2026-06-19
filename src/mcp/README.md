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

## Current Slice 1 behavior

`server.ts` registers only `invoke_prompt_library_command` for the Slice 1
fixture-backed invocation path.

Success `structuredContent` is the reduced invocation payload only, and the
published `outputSchema` requires all four fields:

```text
title
lifecycle
input_mode
prompt_body
```

Failure responses fail closed as `isError: true` with compact model-visible text
content containing `no_prompt_invoked: true`, `error_code`, `message`, and
optional non-executing `suggestions`. Failure responses intentionally omit
`structuredContent` because the current MCP SDK validates any returned
`structuredContent` against the advertised success `outputSchema` when clients
cache `listTools`.

Failure content must not include `prompt_body`.

The visible `content` receipt is compact. The full prompt body is model-visible
through `structuredContent.prompt_body`, not hidden in `_meta`.
