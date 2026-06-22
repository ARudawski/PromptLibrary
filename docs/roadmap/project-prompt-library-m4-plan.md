# Project Prompt Library — Milestone 4 Plan

Status: M4 planning draft
Date: 2026-06-22
Previous gate: M3 / read-only API approved
Next allowed product lane: Slice 4.1 — prompt authoring baseline and metadata conventions

---

## 1. Purpose

Milestone 4 turns the approved read-only prompt-library connector into a local MVP with the first real public prompt set.

M4 is deliberately narrow. It should prove that real prompt files can be authored, validated, loaded by the local runtime, invoked, inspected, listed, and documented without expanding the product.

Initial MVP prompt set:

```text
handoff
grill-me
spec-prompt-creator
```

M4 must not add hosted deployment, private suites, auth/OAuth, database behavior, prompt editing, draft management in ChatGPT, semantic routing, workflow/session state, or cache/admin/debug tools.

---

## 2. Found follow-ups to carry into M4

### F1 — Real prompt files do not exist yet

`validate-prompts` may currently pass with zero local prompt files. That is acceptable before M4, but once M4 begins it must not be treated as local-MVP evidence. M4 must add and validate the actual three prompt files.

### F2 — Slice 4.1 is the only immediate product lane

Do not jump directly to real prompt files. Slice 4.1 must first lock prompt authoring conventions, metadata rules, lifecycle expectations, and alias policy.

### F3 — Runtime may still be fixture-backed

M3 proved the read-only tools with fixture-backed prompt definitions. M4 must verify whether the local MCP runtime can load real `prompts/*.md` files. If not, create and complete a narrow runtime-source alignment task before claiming local MVP.

### F4 — Tool descriptions may still say fixture-backed

Once the runtime source is aligned with real prompts, tool descriptions and docs must stop saying fixture-backed where that would mislead ChatGPT or agents.

### F5 — Cache refresh is safe, not fully async SWR

The cache preserves last-known-good on failed or unsafe refresh. Do not overclaim fully async background stale-while-revalidate behavior, and do not change cache semantics during M4 unless explicitly scoped.

### F6 — Live GitHub source smoke is optional

Live public GitHub source checks remain opt-in and non-blocking for deterministic CI. They are useful later, especially before hosted deployment, but not required for M4 local prompt validation.

### F7 — npm audit caveats must be reported

Agents should report audit findings when observed. They must not silently fix dependency findings in prompt-authoring tasks unless explicitly scoped.

### F8 — Do not expand beyond the three MVP prompts

Do not add `software-idea-sparring-partner`, `review-spec`, QA/refactoring/documentation prompts, or any broader catalog item in M4 unless a later explicit issue opens that scope.

---

## 3. M4 sequencing

Safe order:

```text
M4.0  M4 preflight and issue setup
M4.1  Prompt authoring baseline and metadata conventions
M4.QA.1 Review prompt authoring baseline before real prompt files
M4.1b Runtime source alignment for real prompt files, if still fixture-backed
M4.2  Add handoff.md
M4.3  Add grill-me.md
M4.4  Add spec-prompt-creator.md
M4.5  Real prompt validation, golden tests, and local walkthrough docs
M4.QA Real prompt MVP behavior audit
M4.Gate Coordinator M4 completion gate
```

Do not combine all of M4 into one large coding-agent issue.

---

## 4. Task M4.0 — M4 preflight and issue setup

Type: Coordinator / workflow planning
Priority: high

### Goal

Expose the M4 lane safely without opening broader product work.

### Scope

- Confirm current-state ledger says M3 is complete.
- Confirm next allowed product lane is Slice 4.1.
- Create or expose only Slice 4.1 as executable product work.
- Prepare later M4 tasks as planned/backlog items only.

### Non-goals

- No prompt files.
- No runtime code.
- No hosted deployment.
- No private/auth/DB work.

### Acceptance criteria

- Slice 4.1 is the only executable product implementation task.
- Later M4 tasks exist only as planned/backlog outlines.
- No runtime behavior changed.

---

## 5. Task M4.1 — Prompt authoring baseline and metadata conventions

Type: Coding Agent / Docs
Priority: urgent
Slice: 4.1

### Goal

Create the prompt authoring baseline before real prompt files are added.

### Scope

Add or update:

```text
docs/prompt-authoring.md
prompts/README.md
```

The docs must define:

- prompt file format;
- required YAML frontmatter fields;
- optional frontmatter fields;
- allowed enum values;
- slug and alias rules;
- status rules;
- lifecycle definitions;
- input mode definitions;
- prompt body conventions;
- metadata plan for all three MVP prompts;
- how to run local validation;
- reminder that behavior lives in prompt text, not connector state.

### Required metadata baseline

```yaml
handoff:
  slug: handoff
  lifecycle: one_shot
  input_mode: conversation_context
  status: active
  aliases: []

grill-me:
  slug: grill-me
  lifecycle: interactive_workflow
  input_mode: either
  status: active
  aliases:
    - grill

spec-prompt-creator:
  slug: spec-prompt-creator
  lifecycle: persistent_mode
  input_mode: either
  status: active
  aliases:
    - spec-creator
    - prompt-creator
```

### Non-goals

- Do not add real prompt body files yet.
- Do not change MCP tools.
- Do not change cache behavior.
- Do not add prompt editing, draft management, private prompts, hosted deployment, or extra catalog items.

### Checks

```bash
npm run format:check
npm run lint
npm run validate-prompts
```

### Acceptance criteria

- Authoring docs match validator behavior.
- Metadata plan for the three MVP prompts is explicit.
- Alias policy is minimal and conflict-safe.
- Lifecycle and input-mode expectations are prompt-defined.
- QA can approve before real prompt files are added.

---

## 6. Task M4.QA.1 — Review prompt authoring baseline

Type: QA / Review Agent
Priority: urgent
Depends on: M4.1

### Goal

Approve or correct the prompt authoring baseline before prompt files are created.

### Scope

Review `docs/prompt-authoring.md` and `prompts/README.md` against validator behavior, roadmap expectations, and V1 boundaries.

### Acceptance criteria

Return one of:

```text
approved — proceed to prompt files
changes requested — do not add prompt files yet
blocked — architecture/coordinator decision needed
```

QA must verify the three metadata baselines, alias safety, and that docs do not imply prompt editing, private prompts, broad catalog expansion, or fully async cache behavior.

---

## 7. Task M4.1b — Align local runtime source with real prompt files

Type: Coding Agent
Priority: high
Depends on: M4.1 and M4.QA.1
Create only if current runtime still defaults to test fixtures.

### Goal

Ensure the local MCP server can load real `prompts/*.md` files for the M4 local MVP.

### Scope

If already supported, document and test that support.

If not supported:

- add the smallest local prompt source or configuration path needed to load `prompts/*.md`;
- wire the local server default to the approved source/cache/index path for local MVP;
- preserve fake/fixture sources for deterministic tests;
- update tool descriptions that say fixture-backed.

### Non-goals

- No hosted deployment.
- No private source.
- No DB source.
- No multi-source merging.
- No cache refresh tool.
- No prompt editing.

### Acceptance criteria

- Local server can load real `prompts/*.md` files.
- Core tests remain no-network.
- Existing invoke/inspect/list contracts remain intact.
- No extra ChatGPT-facing tools are added.

---

## 8. Task M4.2 — Add active `handoff` MVP prompt

Type: Coding Agent / Prompt Authoring
Priority: high
Depends on: M4.1 approved and M4.1b resolved if needed

### Goal

Add `prompts/handoff.md` as an active one-shot command.

### Metadata

```yaml
schema_version: "1"
slug: handoff
title: Handoff
description: Produce a concise handoff from the current conversation context.
aliases: []
lifecycle: one_shot
input_mode: conversation_context
status: active
```

### Acceptance criteria

- Prompt validates.
- Invoke works for `handoff`.
- Inspect works for `handoff`.
- List includes `handoff`.
- Invocation payload remains reduced.
- Prompt wording is one-shot and does not establish persistent mode.

---

## 9. Task M4.3 — Add active `grill-me` MVP prompt

Type: Coding Agent / Prompt Authoring
Priority: high
Depends on: M4.1 approved and M4.1b resolved if needed

### Goal

Add `prompts/grill-me.md` as an active interactive workflow command.

### Metadata

```yaml
schema_version: "1"
slug: grill-me
title: Grill Me
description: Interview the user one question at a time until intent and constraints are clear.
aliases:
  - grill
lifecycle: interactive_workflow
input_mode: either
status: active
```

### Acceptance criteria

- Prompt validates.
- `grill-me` and alias `grill` resolve safely.
- Invoke, inspect, and list work.
- List shows canonical `grill-me` once, with alias metadata.
- Prompt wording encodes one-question-at-a-time behavior.
- Connector does not manage workflow state.

---

## 10. Task M4.4 — Add active `spec-prompt-creator` MVP prompt

Type: Coding Agent / Prompt Authoring
Priority: high
Depends on: M4.1 approved and M4.1b resolved if needed

### Goal

Add `prompts/spec-prompt-creator.md` as an active persistent-mode command.

### Metadata

```yaml
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

### Acceptance criteria

- Prompt validates.
- Slug and aliases resolve safely.
- Invoke, inspect, and list work.
- Prompt wording establishes persistent mode.
- Connector does not manage mode lifecycle.

---

## 11. Task M4.5 — Real prompt validation, golden tests, and local MVP walkthrough

Type: Coding Agent + QA handoff
Priority: high
Depends on: M4.2, M4.3, M4.4

### Goal

Validate the three real MVP prompts as a coherent local MVP.

### Scope

Add or update:

```text
test/golden/prompts/*
docs/local-mvp-walkthrough.md
docs/tool-reference.md if real examples replace fixture examples
README.md if local MVP usage changes
```

### Required checks

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

### Required coverage

- all three prompts validate;
- all three invoke successfully;
- all three inspect successfully;
- list shows all three active commands;
- aliases work and do not duplicate list entries;
- invocation payload contains only `title`, `lifecycle`, `input_mode`, and `prompt_body`;
- list output contains no prompt bodies;
- inspect output is inspection-only;
- no cache/source diagnostics leak into normal invocation.

### Docs

`docs/local-mvp-walkthrough.md` must include setup, local MCP run command, validation command, invocation examples for each prompt, inspect/list examples, expected behavior, known limitations, and non-goals.

---

## 12. Task M4.QA — Real prompt MVP behavior audit

Type: QA / Review Agent
Priority: urgent
Depends on: M4.5

### Goal

Audit that M4 produces a real local MVP without violating architecture boundaries.

### QA checklist

- `handoff` is one-shot and uses conversation context.
- `grill-me` is interactive and asks one question at a time.
- `spec-prompt-creator` is persistent mode and establishes a chat role/mode.
- List exposes active prompts only, with no prompt bodies or duplicate alias entries.
- Inspect is active-only and marked `inspection_only` / `no_prompt_invoked`.
- Invoke returns reduced payload only.
- Docs make the local MVP usable and do not claim hosted/private/admin behavior.

### Decision output

```text
approved — M4 local MVP complete
changes requested — fix before M4 gate
blocked — architecture/coordinator decision needed
```

---

## 13. Task M4.Gate — Coordinator M4 completion gate

Type: Coordinator / Architect
Priority: urgent
Depends on: M4.QA approval

### Goal

Accept or reject M4 as the local MVP baseline and decide whether M5 personal-use trial planning may begin.

### Acceptance criteria

M4 can be accepted only if:

- M4.1 through M4.5 are complete;
- QA approved real prompt behavior;
- all three prompts validate;
- all three invoke/inspect/list correctly;
- local walkthrough exists;
- no V1 boundary drift occurred.

### Gate outputs

```text
M4 complete — proceed to M5 personal-use trial planning
```

or:

```text
M4 not complete — fix listed issues before M5
```

After acceptance, update compact workflow state docs.

---

## 14. Do-not-create-yet tasks

Do not create or execute these until M4 is accepted:

- M5.1 personal trial protocol and results log;
- M5.2 tool description/routing tuning;
- M5.3 prompt wording hardening;
- M5.4 hosting readiness decision;
- M6 hosted deployment tasks;
- future private-suite/auth/DB tasks.

---

## 15. M4 done definition

M4 is done only when:

```text
- prompt authoring baseline is approved
- local runtime can load real prompts
- handoff.md exists and validates
- grill-me.md exists and validates
- spec-prompt-creator.md exists and validates
- invoke works for all three
- inspect works for all three
- list shows all three active commands
- prompt-specific golden tests pass
- local MVP walkthrough exists
- QA approves real prompt behavior
- coordinator accepts M4 gate
```

Anything less is not a local MVP.
