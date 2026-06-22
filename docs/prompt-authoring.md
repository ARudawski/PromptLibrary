# Prompt Authoring Guide

Status: Slice 4.1 authoring baseline

This guide defines how Project Prompt Library prompt files are authored before
the first real MVP prompt files are added. It matches the current parser,
validator, and collection validation behavior used by `npm run
validate-prompts`.

Project Prompt Library is retrieval-focused. Prompt behavior lives in the prompt
body and its declared metadata. The connector retrieves, validates, resolves,
invokes, inspects, and lists prompt definitions; it does not execute workflows,
manage conversation state, edit prompts, compose prompts, or choose prompts
without explicit command intent.

## File Format

Prompt definitions are Markdown files with YAML frontmatter and a non-empty
Markdown body:

```markdown
---
schema_version: "1"
slug: example-command
title: Example Command
description: A short description of what this prompt does.
aliases: []
lifecycle: one_shot
input_mode: attached_input
status: active
---

Write the exact prompt instructions here.
```

Files are loaded from the flat `prompts/*.md` directory, excluding the
documentation file `prompts/README.md`. Use one prompt per file. The
recommended filename is the canonical slug plus `.md`, for example
`grill-me.md`.

The parser requires opening and closing `---` YAML frontmatter delimiters,
normalizes line endings to LF, removes exactly one leading LF after the closing
frontmatter delimiter, and preserves the remaining prompt body text. The prompt
body must not be empty after trimming whitespace.

## Required Frontmatter

Every prompt file must include these fields:

```text
schema_version
slug
title
description
aliases
lifecycle
input_mode
```

Required string fields must be non-empty. `aliases` must be present as an array,
even when it is empty:

```yaml
aliases: []
```

`schema_version` is currently authored as `"1"`. The validator requires a
non-empty string; this guide reserves other values for future schema decisions.

## Optional Frontmatter

These fields are allowed:

```text
status
tags
notes
debug_marker
prompt_version
created_at
updated_at
```

Unknown fields fail validation. Optional fields are authoring and inspection
metadata only. Normal invocation may expose only:

```text
title
lifecycle
input_mode
prompt_body
```

Normal invocation must not expose slugs, aliases, descriptions, status,
debug markers, prompt versions, timestamps, source paths, cache diagnostics, or
validation diagnostics.

## Enum Values

Allowed `lifecycle` values:

```text
persistent_mode
interactive_workflow
one_shot
```

Allowed `input_mode` values:

```text
attached_input
conversation_context
either
```

Allowed `status` values:

```text
active
draft
```

## Status Rules

`status` is optional in the validator so historical and draft authoring data can
be validated safely. Runtime exposure is stricter:

- `active` prompts are invokable, inspectable, and listable when they have no
  validation or collection conflicts.
- `draft` prompts may validate, but they are not invokable, inspectable, or
  listable through ChatGPT-facing tools.
- prompts with no `status` may validate, but they are not invokable,
  inspectable, or listable.

The three MVP prompt files added in later M4 tasks must use `status: active`.
Slice 4.1 does not add those real prompt files.

## Slug and Alias Rules

Slugs and aliases are command names. They must be lowercase kebab-case:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Use a minimal alias policy:

- Prefer no aliases unless there is an obvious short command.
- Keep aliases lowercase, short, and unambiguous.
- Do not use aliases for broad categories, fuzzy intent, or semantic routing.
- Do not rely on priority, file order, or "first match wins".

Collection validation fails closed for unsafe command states:

- duplicate slugs;
- an active alias that conflicts with another active prompt slug;
- duplicate active aliases, including the same alias repeated on one prompt;
- an active command string that collides with a draft or status-less prompt
  slug or alias.

Conflicted commands must not be invoked by guessing.

## Lifecycle Meanings

Lifecycle describes what the prompt text is intended to establish. The connector
does not enforce or manage lifecycle behavior after retrieval.

`one_shot`
: Use for a prompt that should produce one bounded result from the current
  request or conversation context. The prompt body should say what output to
  produce and should not establish an ongoing role.

`interactive_workflow`
: Use for a prompt that runs a multi-turn conversational workflow. The prompt
  body must define the interaction rules, such as asking one question at a time.
  The connector does not store workflow progress.

`persistent_mode`
: Use for a prompt that establishes an ongoing chat mode or role until the user
  changes direction. The prompt body must define the mode and boundaries. The
  connector does not track whether that mode is active.

## Input Mode Meanings

Input mode describes where the prompt expects the user-provided material to
come from. The prompt body must explain how to handle the input; the connector
does not infer missing context.

`attached_input`
: The prompt expects explicit input supplied with the command, such as text
  after `@pl grill-me`.

`conversation_context`
: The prompt expects the current conversation to contain enough context.

`either`
: The prompt can work from attached input or conversation context. The prompt
  body should say what to do when context is insufficient.

## Prompt Body Conventions

Prompt bodies are the canonical behavior text returned to the model during
invocation. Write them as exact instructions, not commentary about the file.

Use these conventions:

- Put all behavior, interaction rules, output shape, and stop conditions in the
  body.
- Keep lifecycle behavior prompt-defined; do not rely on connector state.
- Keep input handling prompt-defined; ask for missing input when needed.
- Do not include YAML metadata in the body.
- Do not include source/cache/debug notes in the body.
- Do not ask the connector to edit prompts, manage drafts, pick prompts, run
  workflows externally, or remember workflow state.
- Do not add private-suite, hosted deployment, auth, database, admin, cache
  refresh, or semantic-routing assumptions.

## MVP Metadata Plan

Later M4 prompt-authoring tasks will add exactly these initial MVP prompt files.
Slice 4.1 records the plan only and does not create the files.

```yaml
handoff:
  file: prompts/handoff.md
  schema_version: "1"
  slug: handoff
  title: Handoff
  description: Produce a concise handoff from the current conversation context.
  aliases: []
  lifecycle: one_shot
  input_mode: conversation_context
  status: active

grill-me:
  file: prompts/grill-me.md
  schema_version: "1"
  slug: grill-me
  title: Grill Me
  description: Interview the user one question at a time until intent and constraints are clear.
  aliases:
    - grill
  lifecycle: interactive_workflow
  input_mode: either
  status: active

spec-prompt-creator:
  file: prompts/spec-prompt-creator.md
  schema_version: "1"
  slug: spec-prompt-creator
  title: Spec & Prompt Creator
  description: Establish a chat mode for turning rough requests into precise specs and coding-agent prompts.
  aliases:
    - spec-creator
    - prompt-creator
  lifecycle: persistent_mode
  input_mode: either
  status: active
```

Alias safety check for the MVP plan:

- `handoff` has no aliases.
- `grill` does not equal an MVP slug or another MVP alias.
- `spec-creator` and `prompt-creator` do not equal MVP slugs or other MVP
  aliases.

Do not add extra MVP prompts or aliases in M4 without an explicit later issue.

## Local Validation

Run local prompt validation with:

```bash
npm run validate-prompts
```

The command validates local prompt files under `prompts/*.md`, excluding
`prompts/README.md`, using the same parser, per-prompt validation, and
collection validation rules described here. It is a developer and CI command
only. It does not fetch GitHub, call ChatGPT, expose a ChatGPT-facing validation
tool, edit files, or fix prompts automatically.

Before real prompt files exist, `validate-prompts` may pass with:

```text
files: 0
note: no local prompt Markdown files found.
```

That is acceptable for Slice 4.1. After later M4 prompt-file tasks begin, an
empty prompt set is no longer evidence for the local MVP.
