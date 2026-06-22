# Tool Reference

Status: Slice 3.5 read-only API reference

Project Prompt Library exposes exactly three V1 ChatGPT-facing tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

The tools are read-only. They do not edit prompts, manage drafts, refresh caches,
return cache diagnostics, perform semantic routing, expose private suites, or
execute workflows outside ChatGPT.

## Shared Runtime Rules

- Only active, invokable prompt definitions are exposed through ChatGPT-facing
  tools.
- Draft prompts are not invokable, inspectable, or listable.
- Unknown, draft/not-invokable, ambiguous, invalid, or unavailable prompt states
  fail closed.
- Failure responses omit `structuredContent` and return compact model-visible
  text with `no_prompt_invoked: true`.
- There is no ChatGPT-facing cache refresh, admin, debug, prompt editing, draft
  listing, private/auth, DB, or UI tool.

## invoke_prompt_library_command

Purpose: resolve a known Project Prompt Library command or alias and return the
stored prompt content for ChatGPT to apply.

Input schema:

```ts
{
  command: string;
  attached_input?: string;
}
```

Success `structuredContent` contains exactly the reduced invocation payload:

```json
{
  "title": "Active Basic",
  "lifecycle": "one_shot",
  "input_mode": "attached_input",
  "prompt_body": "Apply the Active Basic fixture prompt to the attached input.\n"
}
```

Visible success content is a compact receipt:

```text
Prompt invoked: Active Basic.
```

Normal invocation must not include slug, aliases, description, status,
source/cache diagnostics, validation diagnostics, debug markers, version fields,
timestamps, or other operational metadata.

Failure shape:

```text
No prompt invoked.
no_prompt_invoked: true
error_code: PROMPT_NOT_FOUND
message: Command "active" was not found.
suggestions: active-basic, active-with-alias
```

Suggestions are non-executing and reference active invokable commands only.

## inspect_prompt_library_command

Purpose: inspect a specific active prompt definition without applying it as
behavior.

Input schema:

```ts
{
  command: string;
}
```

Success `structuredContent`:

```json
{
  "ok": true,
  "type": "prompt_inspection",
  "inspection_only": true,
  "no_prompt_invoked": true,
  "metadata": {
    "schema_version": "1",
    "slug": "active-with-alias",
    "title": "Active With Alias",
    "description": "Active fixture prompt with a command alias.",
    "aliases": ["alias-basic"],
    "lifecycle": "interactive_workflow",
    "input_mode": "either",
    "status": "active"
  },
  "prompt_body": "Use this fixture prompt as a simple alias-backed active command.\n"
}
```

Visible success content states that inspection is not invocation:

```text
Inspection only; no prompt was invoked. Prompt inspected: Active With Alias.
```

Failure shape:

```text
Inspection failed; no prompt was invoked.
inspection_only: true
no_prompt_invoked: true
error_code: PROMPT_NOT_INVOKABLE
message: Command "draft-valid" is not inspectable.
```

Inspection may return full active prompt metadata and body, but it must always
include `inspection_only: true` and `no_prompt_invoked: true`.

## list_prompt_library_commands

Purpose: list active invokable command summaries for discovery.

Input schema:

```ts
{}
```

Success `structuredContent`:

```json
{
  "ok": true,
  "type": "prompt_command_list",
  "commands": [
    {
      "command": "active-basic",
      "title": "Active Basic",
      "description": "Basic active fixture prompt.",
      "aliases": [],
      "lifecycle": "one_shot",
      "input_mode": "attached_input"
    }
  ]
}
```

Visible success content:

```text
Available active Prompt Library commands listed.
```

List output must not include prompt bodies, draft prompts, duplicate alias
entries, validation diagnostics, cache diagnostics, source paths, debug markers,
version fields, timestamps, or admin/debug inventory.

Failure shape:

```text
Command list failed; no prompt was invoked.
no_prompt_invoked: true
error_code: PROMPT_LIBRARY_INVALID
message: Prompt library index is invalid and no prompt summaries were listed.
```
