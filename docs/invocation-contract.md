# Invocation Contract

Status: Slice 1 authoritative contract for the fixture-backed invoke path.

This document reconciles the Slice 1 baseline with the final ALJ-18
implementation and the merged PR #11 outputSchema hardening. It describes the
current local fixture-backed behavior only.

## Runtime Scope

Implemented in Slice 1:

- `invoke_prompt_library_command`
- local fixture-backed prompt loading
- Markdown/frontmatter parsing
- single-prompt and collection validation
- active command lookup by slug and alias
- fail-closed handling for unknown, ambiguous, draft, and invalid commands

Not implemented in Slice 1:

- public GitHub prompt source
- runtime TTL cache, stale refresh, or last-known-good cache
- real prompt files
- `inspect_prompt_library_command`
- `list_prompt_library_commands`
- hosted deployment
- private suites, auth, accounts, database storage, or UI widgets

## Tool Input

`invoke_prompt_library_command` accepts only structured tool input:

```ts
interface InvokePromptInput {
  command: string;
  attached_input?: string;
}
```

The connector does not parse raw `@pl` chat text and does not accept raw
conversation or profile fields.

Forbidden input fields include:

```text
raw_text
conversation
messages
full_chat
system_prompt
user_profile
cache_control
include_drafts
refresh
```

## Success Response

Successful invocation returns model-visible `structuredContent` with exactly the
reduced invocation payload:

```json
{
  "structuredContent": {
    "title": "Active Basic",
    "lifecycle": "one_shot",
    "input_mode": "attached_input",
    "prompt_body": "Apply the Active Basic fixture prompt to the attached input.\n"
  },
  "content": [
    {
      "type": "text",
      "text": "Prompt invoked: Active Basic."
    }
  ]
}
```

The compact visible receipt is informational. The prompt body is model-visible in
`structuredContent.prompt_body`, not hidden in `_meta`.

## Success Payload Keys

The normal invocation payload may contain only:

```text
title
lifecycle
input_mode
prompt_body
```

It must not include:

```text
slug
aliases
description
status
hash
source_path
repo_commit
indexed_at
validation diagnostics
cache diagnostics
debug_marker
prompt_version
created_at
updated_at
```

Success `structuredContent` is intentionally unwrapped. Do not add `ok`, `type`,
or `payload` wrapper fields to successful invocation results.

## Failure Response

Failed invocation must fail closed and must not include `prompt_body`.

Current Slice 1 failures return `isError: true` with compact model-visible text
content and no `structuredContent`:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "No prompt invoked.\nno_prompt_invoked: true\nerror_code: PROMPT_NOT_FOUND\nmessage: Command \"active\" was not found.\nsuggestions: active-basic, active-with-alias"
    }
  ]
}
```

The text content includes:

- `no_prompt_invoked: true`
- `error_code`
- `message`
- optional non-executing `suggestions`

Suggestions are command strings only. They do not invoke a prompt and must only
reference active invokable commands.

## OutputSchema Status

The MCP `outputSchema` describes successful `structuredContent` only:

```text
title
lifecycle
input_mode
prompt_body
```

All four fields are required and additional properties are rejected.

Failure results intentionally omit `structuredContent` because the current MCP
SDK publishes and validates tool output schemas as object schemas. SDK clients
that call `listTools()` first validate any returned `structuredContent`,
including on `isError` results. Returning fail-closed details as text preserves
`no_prompt_invoked: true` without weakening the strict success schema or adding
wrapper metadata to successful invocation results.

## Failure Cases

The current fixture-backed invoke path covers:

| Case | Result |
|---|---|
| Active slug | success |
| Active alias | success |
| Unknown command | fail closed with `PROMPT_NOT_FOUND` |
| Draft or status-less command | fail closed with `PROMPT_NOT_INVOKABLE` |
| Conflicted command | fail closed with `PROMPT_AMBIGUOUS` |
| Invalid library composition | fail closed before unsafe invocation |

## Contract Tests

The authoritative executable coverage is
`test/contract/invoke-prompt-library-command.test.ts`.

It verifies:

- only `invoke_prompt_library_command` is registered in Slice 1;
- input schema contains only `command` and optional `attached_input`;
- output schema requires the four success payload fields;
- success payload is model-visible and excludes forbidden metadata;
- failures omit `structuredContent` after `listTools()` and include
  `no_prompt_invoked: true` in compact text content;
- draft, unknown, and ambiguous commands fail closed;
- the MCP adapter composes fixture-backed use-case behavior outside business
  logic.
