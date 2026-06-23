# Prompts Directory

Status: M4 local MVP active prompt set

This directory contains the approved Project Prompt Library local MVP prompt
definitions. M4 added the first three active public prompt files after the
Slice 4.1 authoring baseline, runtime-source alignment, prompt-specific slices,
Slice 4.5 validation/walkthrough work, PL-110 QA, and PL-111 coordinator gate.

Prompt files belong directly under this directory:

```text
prompts/handoff.md
prompts/grill-me.md
prompts/spec-prompt-creator.md
```

Each prompt file must be Markdown with YAML frontmatter and a non-empty prompt
body. This `README.md` file is documentation and is ignored by local prompt
validation. See [`../docs/prompt-authoring.md`](../docs/prompt-authoring.md) for
the full schema, alias rules, lifecycle and input-mode meanings, and validation
instructions.

Approved M4 MVP metadata:

| Slug | Lifecycle | Input mode | Status | Aliases |
|---|---|---|---|---|
| `handoff` | `one_shot` | `conversation_context` | `active` | none |
| `grill-me` | `interactive_workflow` | `either` | `active` | `grill` |
| `spec-prompt-creator` | `persistent_mode` | `either` | `active` | `spec-creator`, `prompt-creator` |

Run validation from the repository root:

```bash
npm run validate-prompts
```

For the M4 local MVP, `validate-prompts` must report three prompt Markdown
files, all valid and active:

```text
files: 3
valid: 3
active: 3
drafts: 0
statusless: 0
```

Do not add broader catalog prompts, draft-management behavior, prompt editing,
private prompt suites, hosted deployment behavior, auth, database behavior,
cache/admin/debug tools, semantic routing, or workflow/session state from this
directory.
