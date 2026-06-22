# Prompts Directory

Status: Slice 4.1 authoring baseline

This directory is reserved for Project Prompt Library prompt definitions. Slice
4.1 intentionally adds no real prompt files. Later M4 tasks will add the first
three MVP prompts only after this authoring baseline is reviewed.

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

Planned MVP metadata:

| Slug | Lifecycle | Input mode | Status | Aliases |
|---|---|---|---|---|
| `handoff` | `one_shot` | `conversation_context` | `active` | none |
| `grill-me` | `interactive_workflow` | `either` | `active` | `grill` |
| `spec-prompt-creator` | `persistent_mode` | `either` | `active` | `spec-creator`, `prompt-creator` |

Run validation from the repository root:

```bash
npm run validate-prompts
```

`validate-prompts` may pass with zero local prompt Markdown files before the
real prompt slices add approved prompt definitions. Once real prompt work
begins, the three MVP prompt files must validate and remain conflict-free.

Do not add broader catalog prompts, draft-management behavior, prompt editing,
private prompt suites, hosted deployment behavior, auth, database behavior,
cache/admin/debug tools, semantic routing, or workflow/session state from this
directory.
