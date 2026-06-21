# Prompt Schema Draft

Status: Slice 1 fixture-backed schema draft.

This document describes the prompt metadata and Markdown parsing behavior that
exists in the current fixture-backed implementation. It is not yet a real public
GitHub prompt authoring guide; public source and real prompts start in later
slices.

## File Format

Prompt fixtures are Markdown files with YAML frontmatter:

```markdown
---
schema_version: "1"
slug: active-basic
title: Active Basic
description: Basic active fixture prompt.
aliases: []
lifecycle: one_shot
input_mode: attached_input
status: active
---

Apply the Active Basic fixture prompt to the attached input.
```

The parser requires an opening and closing `---` frontmatter delimiter.

## Required Metadata

Current required fields:

```text
schema_version
slug
title
description
aliases
lifecycle
input_mode
```

All required string fields must be non-empty. `aliases` must be present as an
array, even when empty.

## Optional Metadata

Current optional fields:

```text
status
tags
notes
debug_marker
prompt_version
created_at
updated_at
```

Optional fields are authoring/validation metadata. They must not appear in the
normal invocation payload.

Unknown frontmatter fields fail validation.

## Enums

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

If `status` is absent, the prompt can still be valid authoring data, but it is
not invokable in the current Slice 1 index.

## Command Names

`slug` and every alias must be lowercase kebab-case:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Collection validation fails closed for:

- duplicate slugs;
- active aliases that conflict with another active prompt slug;
- duplicate active aliases, including repeated aliases on one prompt;
- active command strings that collide with draft or status-less prompt command
  strings.

Conflicts are not resolved by file order, priority, best guess, or status
preference.

## Prompt Body

The prompt body must be non-empty after trimming whitespace.

Current parser behavior:

- normalizes Markdown line endings to LF before parsing;
- removes exactly one LF separator immediately after the closing frontmatter
  delimiter;
- preserves the remaining prompt body text, including trailing newline content.

The invocation projection does not append metadata or wrapper instructions to
the prompt body.

## Fixture-Backed Limitations

Current Slice 1 fixtures live under `test/fixtures/`.

The fixture-backed invocation path:

- loads local fixture Markdown only;
- does not fetch GitHub;
- does not load real prompt files;
- does not inspect or list commands through ChatGPT-facing tools.

Slice 2.2 adds the public GitHub source adapter as infrastructure only. Slice
2.3 adds core runtime cache TTL behavior as infrastructure only. Real prompt
files under `prompts/*.md`, stale-while-revalidate, last-known-good
preservation, partial-valid/cold-failure cache policy, and real MVP prompt
authoring are later-slice work. Fixture-backed invocation remains the current
ChatGPT-facing runtime path.

## Current Validation Coverage

The current schema behavior is covered by:

- `test/unit/prompt-parser/parsePromptMarkdown.test.ts`
- `test/unit/validation/validatePromptDefinition.test.ts`
- `test/unit/validation/validatePromptCollection.test.ts`
- `test/unit/cache/PromptCache.test.ts`
- `test/unit/cache/PromptIndex.test.ts`
- `test/unit/application/InvokePromptUseCase.test.ts`
- `test/contract/invoke-prompt-library-command.test.ts`

## Local Validation Command

`npm run validate-prompts` validates local prompt files under `prompts/*.md`.
It uses the same parser, per-prompt validation, and collection validation rules
described above.

The command is local developer/CI tooling only. It does not fetch GitHub, call
ChatGPT, expose a runtime validation tool, or edit prompt files.

Valid draft prompts are reported separately and remain non-invokable. Invalid
prompt files and unsafe slug/alias collection conflicts fail with a non-zero
exit code.

The command passes when no local prompt Markdown files exist, which keeps the
early repository gate usable before approved real-prompt slices add MVP prompt
files.
