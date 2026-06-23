# Local MVP Walkthrough

Status: Slice 4.5 local MVP walkthrough

This walkthrough verifies the local Project Prompt Library MVP with the three
approved active prompts:

```text
handoff
grill-me
spec-prompt-creator
```

It uses the local `prompts/*.md` runtime source. It does not require GitHub,
ChatGPT, a tunnel, hosted deployment, private suites, auth, or a database.

## Setup

Install dependencies from the repository root:

```bash
npm install
```

Use Node 22 or newer. The repository scripts are defined in `package.json`.

## Validate Local Prompt Files

Run:

```bash
npm run validate-prompts
```

Expected result for the local MVP:

```text
validate-prompts: OK
files: 3
valid: 3
active: 3
drafts: 0
statusless: 0
```

The exact `prompts_dir` path depends on the local checkout. Any validation
failure means the local MVP is not ready.

## Run The Local MCP Server

Start the local server:

```bash
npm run dev
```

The server uses stdio transport and loads prompt files from the repository
`prompts/` directory through the local prompt source. It registers exactly these
ChatGPT-facing tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

## Invoke The MVP Prompts

Invocation resolves a canonical command or alias and returns the reduced
model-visible payload:

```json
{
  "title": "Grill Me",
  "lifecycle": "interactive_workflow",
  "input_mode": "either",
  "prompt_body": "..."
}
```

The normal invocation payload contains only:

```text
title
lifecycle
input_mode
prompt_body
```

Expected invocation examples:

```text
@pl handoff
```

Returns `Handoff`, lifecycle `one_shot`, input mode
`conversation_context`, and the handoff prompt body.

```text
@pl grill-me
@pl grill
```

Both resolve to `Grill Me`, lifecycle `interactive_workflow`, input mode
`either`, and the same prompt body.

```text
@pl spec-prompt-creator
@pl spec-creator
@pl prompt-creator
```

All three resolve to `Spec & Prompt Creator`, lifecycle
`persistent_mode`, input mode `either`, and the same prompt body.

Normal invocation must not expose slug, aliases, description, status, source
paths, cache diagnostics, validation diagnostics, debug markers, prompt
versions, or timestamps.

## Inspect The MVP Prompts

Inspection is for reading an active prompt definition without applying it as
behavior. It must return:

```json
{
  "ok": true,
  "type": "prompt_inspection",
  "inspection_only": true,
  "no_prompt_invoked": true
}
```

Expected inspect examples:

```text
Inspect @pl handoff
Inspect @pl grill-me
Inspect @pl grill
Inspect @pl spec-prompt-creator
Inspect @pl spec-creator
Inspect @pl prompt-creator
```

Aliases inspect the same canonical prompt metadata and body as their canonical
commands. Inspection must always remain inspection-only and must not invoke the
prompt as behavior.

## List Available Commands

Listing returns active canonical commands only:

```text
grill-me
handoff
spec-prompt-creator
```

The aliases are metadata on their canonical commands:

```text
grill-me aliases: grill
handoff aliases: none
spec-prompt-creator aliases: spec-creator, prompt-creator
```

Aliases must not appear as duplicate list entries. List output must not include
prompt bodies, source/cache diagnostics, validation diagnostics, debug markers,
prompt versions, timestamps, draft prompts, or admin/debug inventory.

## Deterministic Checks

Run the full PL-109 local gate:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

`test:contract` verifies the three-prompt local MVP behavior through the MCP
tools. `test:golden` freezes the approved local MVP tool payloads and prompt
body hashes, and guards that the tests do not call network fetch.

## Known Limitations

- This is a local MVP. Hosted deployment is not implemented.
- The command suite is public local prompt files for V1. Private suites, auth,
  OAuth, user accounts, database behavior, and encrypted private prompts are not
  implemented.
- The connector retrieves prompt definitions. It does not execute workflows,
  manage conversation state, compose prompts, select prompts semantically, edit
  prompts, manage drafts, or expose cache/admin/debug controls through ChatGPT.
- Live ChatGPT routing and tunnel smoke checks are outside this deterministic
  local walkthrough unless a later issue explicitly asks for them.
