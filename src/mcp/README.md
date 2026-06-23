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

## Current Slice 1, Slice 3.2, Slice 3.4, and PL-105 behavior

`server.ts` registers `invoke_prompt_library_command`,
`inspect_prompt_library_command`, and `list_prompt_library_commands`. The
`npm run dev` entrypoint loads local `prompts/*.md` files through
`LocalPromptFileSource`; deterministic tests may still inject fixture or fake
sources.

Invocation success `structuredContent` is the reduced invocation payload only,
and the published `outputSchema` requires all four fields:

```text
title
lifecycle
input_mode
prompt_body
```

Inspect success `structuredContent` includes `ok: true`,
`type: prompt_inspection`, `inspection_only: true`, `no_prompt_invoked: true`,
full active prompt metadata, and `prompt_body`.

List success `structuredContent` includes `ok: true`,
`type: prompt_command_list`, and a `commands` array. Each command summary
contains only:

```text
command
title
description
aliases
lifecycle
input_mode
```

List output must not include prompt bodies, draft commands, cache diagnostics,
validation diagnostics, or admin/debug inventory.

Failure responses fail closed as `isError: true` with compact model-visible text
content containing `inspection_only: true` where relevant,
`no_prompt_invoked: true`, `error_code`, `message`, and optional non-executing
`suggestions`. Failure responses intentionally omit `structuredContent` because
the current MCP SDK validates any returned `structuredContent` against the
advertised success `outputSchema` when clients cache `listTools`.

Failure content must not include `prompt_body`.

The visible `content` receipt is compact. The full prompt body is model-visible
through `structuredContent.prompt_body`, not hidden in `_meta`.
