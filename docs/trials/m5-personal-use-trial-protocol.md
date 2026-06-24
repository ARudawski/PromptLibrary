# M5 Personal-Use Trial Protocol

Status: approved by M5.QA.1 through PL-122; used for PL-123 / M5.2 trial evidence accepted on 2026-06-24
Owner: historical M5 trial runner for PL-123; PL-124 owns trial evidence review and issue triage after PL-133 closeout
Scope: personal-use evidence for the three approved M4 MVP prompts

This protocol defined how to run the M5 personal-use trial. It does not approve
hosting, change prompts, change aliases, or authorize any runtime
implementation work. PL-123 / M5.2 used this protocol and recorded evidence in
Linear comments; PL-124 / M5.3 owns evidence review, triage, and any
trial-log/findings documentation decision after the PL-133 State Checkpoint is
durable.

## Goal

Decide whether the local Project Prompt Library MVP is useful enough in real
personal work to justify later hardening or hosted deployment planning.

The trial must answer:

```text
Do handoff, grill-me, and spec-prompt-creator create enough practical value in
real work to continue toward M5 follow-up work and an eventual M6 decision?
```

## Trial Window

PL-123 ran the trial after M5.QA.1 approval, PL-130 closeout, and the PL-132
ChatGPT app/schema blocker resolution. Do not run more M5.2 trial entries unless
a coordinator explicitly reopens the trial window.

Minimum trial requirement:

```text
At least 2 real uses per prompt across at least 3 separate work sessions.
```

Allowed substitute:

```text
At least 1 real use per prompt plus a recorded reason why additional use was
not useful, not available, or not safe during the trial window.
```

Recommended duration:

```text
3 to 7 calendar days, or until the minimum usage requirement is satisfied.
```

Do not treat a single successful use as hosting readiness.

## Approved Trial Scope

Use only the three approved active M4 MVP prompts:

| Prompt | Required command | Allowed aliases | Required scenario |
|---|---|---|---|
| Handoff | `handoff` | none | Produce a handoff from a real current or recent working conversation. |
| Grill Me | `grill-me` | `grill` | Clarify a real idea, plan, or decision by answering one question at a time. |
| Spec & Prompt Creator | `spec-prompt-creator` | `spec-creator`, `prompt-creator` | Turn a rough real request into a precise spec and coding-agent prompt. |

The trial may invoke, inspect, and list prompts through the approved V1 tools
only:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

## Setup And Validation

Perform these steps from the repository root before recording trial evidence.

1. Confirm the repository state:

```bash
git status --short --branch
git rev-parse HEAD
```

Record the branch from `git status --short --branch` and the exact commit from
`git rev-parse HEAD` in the trial log.

2. Install dependencies if needed:

```bash
npm install
```

3. Validate local prompt files:

```bash
npm run validate-prompts
```

Expected local MVP summary:

```text
validate-prompts: OK
files: 3
valid: 3
active: 3
drafts: 0
statusless: 0
```

4. Run the local MCP walkthrough in
[`../local-mvp-walkthrough.md`](../local-mvp-walkthrough.md) far enough to prove:

- the stdio MCP server starts through `npm run dev`;
- the MCP SDK `StdioClientTransport` can call the server;
- `invoke_prompt_library_command`, `inspect_prompt_library_command`, and
  `list_prompt_library_commands` are available;
- `handoff`, `grill-me`, `grill`, `spec-prompt-creator`, `spec-creator`, and
  `prompt-creator` resolve as documented.

5. Record the local validation results in the trial log before the first use.

Do not record a real trial entry if local validation fails. Instead, mark the
trial as held and create or link a follow-up issue using the rules below.

## Running A Trial Use

Each trial use must be a real personal work scenario, not a synthetic test.

The default trial surface is a local MCP client using the stdio MCP server.
Live ChatGPT, tunnel, hosted, or platform-mediated evidence does not count for
this protocol unless a separate approved spike records explicit scope, setup
evidence, and safety boundaries first.

If a separate approved ChatGPT app or connector smoke check is performed, verify
the app/action settings against
[`../chatgpt-app-schema.md`](../chatgpt-app-schema.md) before recording a
successful ChatGPT-surface use. The historical `Project Prompt Library Local
Proof` proof-only schema is not the current M5 trial surface.

For each use:

1. Pick one required scenario from the table above.
2. Use the canonical command or one allowed alias.
3. Provide the real work context or input needed by the prompt.
4. Let the prompt behavior run normally.
5. Record the evidence fields in
   [`m5-personal-use-trial-log.md`](m5-personal-use-trial-log.md).

Use `inspect_prompt_library_command` only to inspect a prompt before or after a
use. Inspection is not a trial use because it must not apply the prompt as
behavior.

Use `list_prompt_library_commands` only for discovery or sanity checks. Listing
is not a trial use because it does not return a prompt body.

## Evidence Fields

Every trial entry must record:

- entry id;
- date/time and timezone;
- work-session id;
- trial surface, normally local MCP client; ChatGPT, tunnel, hosted, or
  platform-mediated surfaces require explicit separate approval and setup
  evidence before they count;
- repository branch and commit;
- prompt used;
- command or alias used;
- scenario type;
- context/input summary, with private details redacted if needed;
- expected behavior;
- actual behavior;
- usefulness rating from 1 to 5;
- friction rating from 1 to 5;
- what was useful;
- what failed or felt awkward;
- whether prompt wording needs adjustment;
- whether tool metadata or routing needs adjustment;
- whether docs need adjustment;
- whether tests or validation need adjustment;
- follow-up issue link, if created;
- trial verdict for the entry: pass, hold, or fail.

Do not fabricate evidence. If the trial cannot be run, record the blocker.

## Pass, Hold, And Fail Criteria

Use these criteria for the M5.2 trial summary and later M5.3 triage.

Pass:

- minimum usage count is met, or every skipped use has a recorded reason;
- all three prompts were tried in realistic work or explicitly skipped with a
  reason;
- average usefulness is at least 3 across completed uses;
- no critical local setup, routing, or prompt-behavior blocker prevents normal
  local use;
- follow-up needs are specific enough for M5.3 triage.

Hold:

- local setup, routing, or validation is blocked but appears fixable;
- evidence is too thin to judge usefulness;
- one prompt cannot be used for a practical reason that needs coordinator or QA
  review;
- docs are not sufficient for the next runner to reproduce the trial.

Fail:

- local validation cannot pass and no safe local trial path remains;
- prompt behavior is consistently not useful in real work;
- the connector encourages forbidden behavior such as prompt editing, semantic
  routing, workflow/session state, private-suite behavior, or hosting work;
- trial findings cannot be turned into bounded follow-up issues.

## Follow-Up Issue Rules

Create or request follow-up issues only when the evidence is concrete.

Use these categories:

| Finding type | Follow-up owner |
|---|---|
| Prompt wording problem | Coding Agent, only after M5.3 triage authorizes prompt changes |
| Alias or tool metadata problem | Coding Agent, only after M5.3 triage authorizes runtime or metadata changes |
| Local setup or walkthrough problem | Coding Agent or QA Agent, depending on whether a fix or verification is needed |
| Documentation gap | Coding Agent for docs fixes, QA Agent for independent doc review |
| Test or golden coverage gap | Coding Agent after M5.3 triage |
| Hosting-readiness question | Coordinator gate only, not a trial-runner implementation task |

Each follow-up must include:

- link to the trial entry;
- exact observed behavior;
- desired outcome;
- why the issue matters;
- explicit non-goals.

Do not create broad hardening, hosting, private-suite, auth, DB, prompt-catalog,
semantic-routing, or workflow-engine tasks from vague discomfort.

## What Not To Change During The Trial

During M5.2 trial execution, do not change:

- prompt files;
- aliases;
- prompt metadata;
- runtime code;
- MCP adapter behavior;
- tool names or schemas;
- cache behavior;
- golden snapshots;
- hosted deployment setup;
- private-suite, auth/OAuth, DB, prompt editing, draft management, semantic
  routing, or workflow/session behavior;
- additional real prompt files.

If a change seems necessary, record the evidence and stop or hold the affected
trial path until M5.3 triage or a coordinator decision authorizes follow-up
work.

## Documentation Requirements

Future M5 reports must include:

```text
Documentation change log:
- Updated:
- Verified unchanged:
- Intentionally not updated:
- Follow-up docs needed:
```

Trial findings must update the trial log or link to the Linear evidence. If a
new findings document is added later, update the relevant indexes in
`README.md`, `docs/README.md`, and `docs/roadmap/README.md` as needed.

## Completion Checklist

Before M5.2 can be considered ready for M5.3 triage:

- local validation result is recorded;
- repository branch and commit are recorded from the explicit setup commands;
- trial surface is recorded, with separate approval/setup evidence for any
  ChatGPT, tunnel, hosted, or platform-mediated surface;
- any ChatGPT app/action smoke surface has been verified against
  [`../chatgpt-app-schema.md`](../chatgpt-app-schema.md) and is not using the
  old Slice 0 proof-only schema;
- at least three separate work-session ids are recorded, unless the trial is
  held or failed with a reason;
- required usage count is met or skipped uses have reasons;
- every prompt has at least one entry or a documented skip;
- every material friction has a follow-up issue link or an explicit "not worth
  fixing" note;
- no trial entry includes fabricated evidence;
- no forbidden implementation or hosting work was performed.
