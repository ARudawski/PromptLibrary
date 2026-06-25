# Project Prompt Library — Milestone 5 Plan

Status: M5 plan; current routing lives in the current-state ledger
Date: 2026-06-24
Current routing source: `../workflows/current-state-ledger.md`
Audience: Codex Prompt Coordinator, Coding Agent, Review Agent, QA Agent, Coordinator/Architect

---

## 1. Executive summary

Milestone 5 validates whether the local MVP is actually useful in real personal work before spending effort on hosting, routing polish, or broader product expansion.

M4 proved that the local connector can load three real prompts and expose them through the approved read-only tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

M5 must answer a different question:

> Is the local Prompt Library useful enough in real work to justify hardening and hosting?

M5 is not a feature-expansion milestone. It is a **personal-use trial and evidence-driven refinement milestone**.

The M5 plan proceeds in controlled slices:

```text
M5.0  M5 preflight and issue setup
M5.1  Personal-use trial protocol and results log
M5.QA.1 Review trial protocol before trial begins
M5.2  Run personal-use trial and record evidence
M5.3  Trial evidence review and issue triage
M5.4  Evidence-based prompt/tool/docs hardening, only if justified
M5.5  Local MVP retest after any hardening
M5.QA Real-use readiness audit
M5.Gate Hosting-readiness / M6 decision gate
```

The important rule:

> Do not start hosting, extra prompts, private suites, auth, DB work, or broad runtime changes during M5 unless the M5 gate explicitly accepts them for a later milestone.

---

## 2. M5 purpose

M5 should produce enough real-use evidence to decide one of these outcomes:

```text
A. Proceed toward hosted deployment planning.
B. Keep using locally and improve prompt wording/tool metadata first.
C. Stop or redesign because the connector is not useful enough.
```

M5 should not assume the product is worth hosting just because the tests pass. A perfectly tested tool that nobody wants to use is still just a very polite paperweight with a CI badge.

---

## 3. Source basis

M5 starts from the approved M4 local MVP:

- `handoff`
- `grill-me`
- `spec-prompt-creator`

M4 delivered:

- local real prompt files;
- local prompt validation;
- local runtime loading from `prompts/*.md`;
- invoke/inspect/list coverage;
- local MVP walkthrough;
- golden tests;
- QA approval;
- coordinator gate acceptance.

M5 does not reopen those decisions unless the trial reveals a concrete problem.

---

## 4. Found follow-ups to carry into M5

### F1 — Documentation discipline was not strong enough in M4

M4 worked, but coding/review/QA agents were not sufficiently incentivized to update documentation whenever behavior changed.

M5 fixes that by making documentation part of every task contract.

Every M5 task must include:

```text
Documentation scope
Documentation acceptance gate
Documentation change log
```

Every agent must either update docs or explicitly justify why no documentation changed.

No “code complete, docs later.” That phrase is where maintainability goes to die in a hoodie.

### F2 - Current M5 routing lives in the ledger

M5.1 protocol/log work is complete through PL-121 / PR #67, M5.QA.1
approved the protocol through PL-122, and M5.2 trial evidence was accepted
through PL-123. PL-133 recorded the M5.2 State Checkpoint, and PL-124 captured
M5.3 trial findings.

Use `../workflows/current-state-ledger.md` to decide the current M5 lane, next
gate, queue exposure, and whether conditional M5.4/M5.5 work is skipped,
canceled, or exposed. Do not create or execute M5.4/M5.5 work unless the ledger
and an explicit coordinator path authorize it.

### F3 — Hosting is still blocked

Hosted deployment belongs to M6 or later. M5 may prepare a readiness decision, but it must not implement hosting.

### F4 — Runtime hardening must be evidence-based

M5 may discover improvements to:

- prompt wording;
- aliases;
- tool descriptions;
- local walkthrough docs;
- failure text;
- documentation structure;
- test expectations.

Do not change these speculatively. Tie every refinement to trial evidence.

### F5 — No prompt-catalog expansion

M5 trial uses the three M4 prompts only. Do not add:

```text
software-idea-sparring-partner
review-spec
QA prompt
refactoring prompt
documentation prompt
```

unless a later explicit milestone opens catalog expansion.

### F6 — Live ChatGPT / tunnel / hosted smoke is optional and gated

M5 may document whether live ChatGPT routing should be tested later, but M5 does not require hosted endpoint work.

If a live ChatGPT/tunnel experiment is proposed, it must be treated as a separate spike with explicit scope and safety boundaries.

### F7 — npm audit caveats must still be reported

Agents must report npm audit status when observed or when audit is run. Do not silently fix audit findings during trial tasks unless explicitly scoped.

---

## 5. Documentation policy for M5

This section is mandatory for all M5 agents.

### 5.1 General rule

Every M5 task must answer:

```text
What changed for future humans or agents?
Where is that documented?
```

If the answer is “nothing,” the agent must say why.

### 5.2 Required documentation surfaces

Depending on the change, agents must update or explicitly verify one or more of:

```text
README.md
AGENTS.md
docs/README.md
docs/workflows/current-state-ledger.md
docs/local-mvp-walkthrough.md
docs/tool-reference.md
docs/prompt-authoring.md
docs/qa/test-strategy.md
docs/qa/ci-evidence.md
prompts/README.md
docs/roadmap/project-prompt-library-m5-plan.md
docs/trials/m5-personal-use-trial-protocol.md
docs/trials/m5-personal-use-trial-log.md
```

### 5.3 Documentation change log requirement

Every coding/review/QA/coordinator report must include:

```text
Documentation change log:
- Updated:
- Verified unchanged:
- Intentionally not updated:
- Follow-up docs needed:
```

This is not optional.

### 5.4 Documentation acceptance gate

A task cannot be accepted unless one of these is true:

```text
A. Relevant docs were updated and reviewed.
B. The agent explicitly documented why no docs changed, and Review/QA accepted that reason.
C. A follow-up docs issue was created/linked because the doc update is intentionally deferred.
```

### 5.5 Review Agent documentation duty

Review Agent must check:

- whether the PR changed behavior, prompt text, config, commands, scripts, tests, workflow state, or user instructions;
- whether relevant docs were updated;
- whether docs now contradict the current-state ledger;
- whether stale examples remain in required-reading docs;
- whether “no docs needed” is believable.

### 5.6 QA Agent documentation duty

QA Agent must verify that docs are usable, not just present. For M5, this especially means:

- trial protocol is executable;
- trial log template captures useful evidence;
- local walkthrough still matches actual commands;
- tool reference matches real tool behavior;
- known limitations are not buried in folklore.

### 5.7 Coordinator documentation duty

Coordinator must update compact state when a gate changes:

```text
docs/workflows/current-state-ledger.md
```

Coordinator must also either update or explicitly defer long-form docs after gate decisions.

---

## 6. M5 success criteria

M5 is successful if it produces credible evidence for a hosting/readiness decision.

Minimum evidence:

- trial protocol exists;
- trial log exists;
- at least one personal-use trial period is completed;
- each of the three prompts is used in at least one realistic scenario, or skipped with a recorded reason;
- friction, failures, and useful outcomes are recorded;
- any refinements are tied to evidence;
- docs are updated with the trial findings and current limitations;
- QA gives a proceed/hold/stop recommendation;
- coordinator accepts or rejects readiness for M6 planning.

---

## 7. M5 non-goals

M5 must not implement:

- hosted deployment;
- production HTTPS endpoint;
- private prompt suites;
- user accounts;
- auth/OAuth;
- database-backed prompt records;
- encrypted prompt storage;
- prompt editing in ChatGPT;
- draft management in ChatGPT;
- prompt marketplace;
- semantic search;
- automatic prompt selection;
- workflow/session state engine;
- prompt composition engine;
- extra prompt files beyond the M4 three;
- ChatGPT-facing cache refresh/admin/debug tools.

---

# 8. Task outlines

## Task M5.0 — M5 preflight and issue setup

Type: Coordinator / workflow planning  
Priority: high  
Status: historical setup task; M5.1 is complete through PL-121 / PR #67,
M5.QA.1 is approved through PL-122, M5.2 trial evidence was accepted
through PL-123, and M5.3 findings were captured through PL-124.

### Goal

Prepare the M5 lane without opening speculative implementation work.

### Scope

- Confirm current-state ledger says M5.1 is complete and PL-122 approved the
  protocol.
- Confirm the current-state ledger records the latest accepted M5 gate,
  checkpoint, next lane, and blocked-lane state before exposing later M5 work.
- Keep later M5 tasks as blocked/backlog items until their predecessor gates pass.

### Documentation scope

Update or verify:

```text
docs/roadmap/project-prompt-library-m5-plan.md
docs/roadmap/README.md
docs/README.md
docs/workflows/current-state-ledger.md
```

### Non-goals

- No trial execution.
- No prompt changes.
- No runtime changes.
- No hosting work.
- No extra prompt files.

### Checks

At minimum:

```bash
npm run format:check
npm run validate-prompts
```

### Acceptance criteria

- M5 plan is stored in the repo.
- Current M5 state agrees with the current-state ledger.
- The current-state ledger, not this roadmap plan, identifies the executable M5
  lane and conditional hardening/readiness routing.
- Later M5 tasks are created only as blocked/backlog outlines.
- Documentation change log is included.

---

## Task M5.1 — Personal-use trial protocol and results log

Type: Coding Agent / Docs  
Priority: urgent  
Slice: 5.1

### Goal

Create the trial protocol and results log that will guide the M5 personal-use trial.

### Scope

Add:

```text
docs/trials/m5-personal-use-trial-protocol.md
docs/trials/m5-personal-use-trial-log.md
```

Update indexes if needed:

```text
docs/README.md
README.md
docs/roadmap/README.md
```

The protocol must define:

- trial goal;
- trial duration or minimum usage count;
- required scenarios;
- how to run local validation before trial;
- how to run or connect the local MCP server;
- how to invoke/list/inspect the prompts;
- what evidence to record;
- pass/hold/fail criteria;
- when to create follow-up issues;
- what not to change during the trial;
- documentation requirements for all future trial findings.

### Required trial scenarios

At minimum, the protocol must cover realistic use of:

```text
handoff
grill-me
spec-prompt-creator
```

Each scenario must record:

- date/time;
- prompt used;
- command or alias used;
- context/input;
- expected behavior;
- actual behavior;
- usefulness rating;
- friction;
- whether prompt wording needs adjustment;
- whether tool metadata/routing needs adjustment;
- whether docs need adjustment;
- follow-up issue link, if created.

### Documentation scope

This task is documentation-first.

Must add/update:

```text
docs/trials/m5-personal-use-trial-protocol.md
docs/trials/m5-personal-use-trial-log.md
```

Must also update index docs if the new trial docs would otherwise be hidden:

```text
docs/README.md
docs/roadmap/README.md
README.md if needed
```

### Non-goals

- Do not run the trial yet.
- Do not change prompt wording.
- Do not change aliases.
- Do not change runtime code.
- Do not add hosting or private-suite work.
- Do not add extra prompt files.

### Checks

Run and report:

```bash
npm run format:check
npm run lint
npm run validate-prompts
```

### Acceptance criteria

- Trial protocol is executable by a human without guessing.
- Trial log template captures enough evidence for M5.3 triage.
- Docs explicitly say M5.1 does not approve hosting or implementation changes.
- Documentation change log is included.

### Report back with

```text
Documentation change log:
- Updated:
- Verified unchanged:
- Intentionally not updated:
- Follow-up docs needed:
```

---

## Task M5.QA.1 — Review personal-use trial protocol

Type: QA / Review Agent  
Priority: urgent  
Depends on: M5.1

### Goal

Approve or correct the personal-use trial protocol before the trial begins.

### Scope

Review:

```text
docs/trials/m5-personal-use-trial-protocol.md
docs/trials/m5-personal-use-trial-log.md
docs/README.md
docs/roadmap/README.md
README.md if changed
```

Check whether the protocol is specific enough to produce useful evidence.

### Documentation scope

QA must verify:

- trial docs are discoverable;
- protocol and log do not contradict current-state ledger;
- local MVP walkthrough remains compatible;
- trial docs include explicit documentation fields for future changes.

### Non-goals

- Do not change prompt wording unless explicitly requested.
- Do not run the trial.
- Do not create M5.2/M5.3/M5.4 implementation tasks unless the coordinator asks.

### Acceptance criteria

Return one of:

```text
approved — proceed to personal-use trial
changes requested — do not start trial yet
blocked — architecture/coordinator decision needed
```

### Required report section

```text
Documentation review:
- Docs sufficient:
- Docs missing:
- Stale docs found:
- Required follow-ups:
```

---

## Task M5.2 — Run personal-use trial and record evidence

Type: Human / Coordinator-supported trial  
Priority: high  
Depends on: M5.QA.1 approval

### Goal

Use the local MVP in real work and record evidence in the trial log.

### Scope

Run the approved M5.1 protocol.

Use each prompt in realistic work:

```text
handoff
grill-me
spec-prompt-creator
```

Recommended minimum:

```text
at least 2 real uses per prompt
or 1 use per prompt plus a recorded reason why further use was not useful
```

Record every trial entry in:

```text
docs/trials/m5-personal-use-trial-log.md
```

or a linked issue/comment if the repo should not mutate during the trial.

### Documentation scope

This task is mostly documentation/evidence.

Must update:

```text
docs/trials/m5-personal-use-trial-log.md
```

or record evidence in Linear and link it from the log later.

### Evidence to capture

For each use:

- prompt;
- command/alias;
- local setup;
- context;
- expected behavior;
- actual behavior;
- usefulness;
- friction;
- changed behavior desired;
- changed docs desired;
- issue link, if needed.

### Non-goals

- Do not edit prompts during the trial.
- Do not tune tool metadata during the trial.
- Do not start hosted deployment.
- Do not add new prompts.
- Do not treat one good run as enough for hosting.

### Acceptance criteria

- Trial log contains enough entries to evaluate usefulness.
- Every prompt was tried or skipped with a recorded reason.
- Frictions and useful outcomes are recorded.
- Documentation needs are explicitly captured.

---

## Task M5.3 - Trial evidence review and issue triage

Type: Coordinator / Review / QA  
Priority: high  
Depends on: M5.2
Status: captured through PL-124; no evidence-backed M5.4 hardening issue
currently justified

### Goal

Turn trial evidence into a decision and a small set of follow-up issues.

### Scope

Review the trial log and classify findings as:

```text
prompt wording issue
tool description/routing issue
local runtime friction
documentation issue
test coverage issue
not worth fixing
future milestone
```

Create follow-up issues only for findings backed by trial evidence.

### Documentation scope

Must update or create:

```text
docs/trials/m5-trial-findings.md
```

or add a findings section to:

```text
docs/trials/m5-personal-use-trial-log.md
```

Must update docs/indexes if new findings docs are added.

### Non-goals

- Do not implement fixes in this triage task.
- Do not decide hosting readiness unless the M5 gate task is reached.
- Do not create broad refactor tasks from vague discomfort.

### Acceptance criteria

- Every material trial finding is classified.
- Each proposed follow-up has evidence.
- Non-issues are explicitly closed as “not worth fixing” or “future milestone.”
- Documentation change log is included.

---

## Task M5.4 - Evidence-based prompt/tool/docs hardening

Type: Coding Agent  
Priority: conditional  
Depends on: M5.3  
Create or execute only if trial evidence justifies changes and the
current-state ledger plus an explicit coordinator path expose this lane.

### Goal

Apply the smallest evidence-backed improvements discovered during the trial.

### Possible scope

Only if backed by M5.3 findings:

- prompt wording tweaks;
- alias changes;
- tool description wording tweaks;
- local walkthrough fixes;
- tool-reference fixes;
- golden test updates for changed prompt bodies;
- additional docs examples.

### Documentation scope

Documentation is mandatory in this task.

If prompt behavior changes, update:

```text
prompts/*.md
docs/local-mvp-walkthrough.md
docs/tool-reference.md if examples changed
docs/trials/m5-trial-findings.md or trial log follow-up section
```

If tool descriptions change, update:

```text
docs/tool-reference.md
docs/local-mvp-walkthrough.md if user-facing behavior changes
```

If docs-only change, state why no code changed.

### Non-goals

- No hosting.
- No private/auth/DB work.
- No extra prompt files.
- No semantic routing.
- No workflow/session engine.
- No speculative prompt rewrite without evidence.

### Checks

Run and report depending on change type:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:contract
npm run test:golden
npm run validate-prompts
```

Prompt wording changes must update golden hashes intentionally.

### Acceptance criteria

- Every change links to trial evidence.
- Tests and golden files match intentional behavior.
- Docs are updated or explicitly justified unchanged.
- Documentation change log is included.

---

## Task M5.5 — Local MVP retest after hardening

Type: QA / Coding Agent  
Priority: conditional  
Depends on: M5.4 if M5.4 exists; otherwise can be skipped by coordinator decision.
Skip or cancel this lane unless M5.4 exists and the current-state ledger plus an
explicit coordinator path expose retest work.

### Goal

Re-run the local MVP checks after evidence-based hardening.

### Scope

Validate:

- local prompt files;
- invoke/list/inspect behavior;
- aliases;
- prompt body hashes;
- local walkthrough accuracy;
- no regression in read-only boundaries.

### Documentation scope

Must update:

```text
docs/trials/m5-trial-findings.md
```

or trial log with retest outcome.

Must verify:

```text
docs/local-mvp-walkthrough.md
docs/tool-reference.md
```

### Checks

Run and report:

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

### Acceptance criteria

- Local MVP is green after hardening.
- Docs match behavior.
- Documentation change log is included.

---

## Task M5.QA — Real-use readiness audit

Type: QA Agent  
Priority: urgent  
Depends on: M5.3 and M5.5 if M5.5 exists

### Goal

Audit whether M5 produced enough evidence for a hosting/readiness decision.

### Scope

Review:

```text
docs/trials/m5-personal-use-trial-protocol.md
docs/trials/m5-personal-use-trial-log.md
docs/trials/m5-trial-findings.md if present
docs/local-mvp-walkthrough.md
docs/tool-reference.md
prompt files
test/golden files
```

### Documentation scope

QA must explicitly review documentation quality and current-state accuracy.

Required report section:

```text
Documentation audit:
- Trial docs complete:
- Walkthrough accurate:
- Tool reference accurate:
- Prompt docs accurate:
- Current-state docs accurate:
- Missing docs:
```

### Decision output

Return one of:

```text
approved — proceed to M5.Gate
changes requested — fix before M5.Gate
blocked — architecture/coordinator decision needed
```

### QA recommendation

QA should recommend one of:

```text
proceed toward hosted deployment planning
run another local trial loop
apply prompt/tool/docs hardening first
stop or redesign
```

---

## Task M5.Gate — Coordinator M5 completion and M6 readiness decision

Type: Coordinator / Architect  
Priority: urgent  
Depends on: M5.QA

### Goal

Decide whether M5 is complete and whether M6 hosted deployment planning may begin.

### Scope

Review:

- M5.1 protocol;
- trial log;
- trial findings;
- QA recommendation;
- any hardening changes and retest results;
- docs status.

### Documentation scope

Coordinator must update:

```text
docs/workflows/current-state-ledger.md
```

Coordinator must also update or explicitly defer:

```text
README.md
docs/README.md
docs/roadmap/README.md
docs/qa/test-strategy.md
docs/local-mvp-walkthrough.md
```

depending on the decision.

### Gate outputs

Return one of:

```text
M5 complete — proceed to M6 hosted deployment planning
M5 incomplete — run another trial loop
M5 incomplete — apply evidence-backed hardening first
M5 failed — stop or redesign before hosting
```

### Acceptance criteria

- Decision is tied to trial evidence.
- M6 is not opened without a clear justification.
- Documentation change log is included.
- Current-state ledger is updated if the gate changes project state.

---

# 9. Do-not-create-yet tasks

Do not create or execute these until M5 evidence and gate decisions justify them:

## M6 hosted deployment planning

Reason: depends on M5.Gate accepting hosted-readiness.

## Additional prompt catalog expansion

Reason: M5 tests usefulness of the three-prompt MVP only.

## Private suites / auth / DB

Reason: not V1, not M5.

## Semantic routing / automatic prompt selection

Reason: still explicitly outside V1.

## Prompt editor / draft manager

Reason: explicitly outside the ChatGPT-facing runtime boundary.

---

# 10. Coordinator prompt for next issue batch

```text
Refresh the Milestone 5 issue batch for Project Prompt Library.

Current state:
- Read `docs/workflows/current-state-ledger.md` for detailed phase, active lane,
  next lane, queue exposure, caveats, and blocked work.
- Do not start hosted deployment, private suites, auth/OAuth, DB, prompt editing, draft management, semantic routing, workflow/session state, extra prompts, or broader runtime changes unless the ledger and an explicit coordinator path authorize it.

Create or expose only the immediate task named by the current-state ledger.

Prepare but do not execute until dependencies are met:
- M5.4 - Evidence-based prompt/tool/docs hardening, conditional only if the current-state ledger and coordinator path expose it.
- M5.5 - Local MVP retest after hardening, conditional only if M5.4 exists.
- M5.Gate - Coordinator M5 completion and M6 readiness decision.

Important M5 process rule:
Every task must include Documentation scope, Documentation acceptance gate, and Documentation change log. Coding agents, Review agents, QA agents, and Coordinator agents must either update relevant docs or explicitly justify why docs did not change.
```

---

# 11. M5 done definition

M5 is done only when:

```text
- trial protocol exists
- trial log exists
- trial protocol QA passes
- personal-use trial evidence is recorded
- every material finding is triaged
- evidence-backed changes are either completed or explicitly deferred
- docs are updated or explicitly justified unchanged
- QA gives a real-use readiness recommendation
- coordinator accepts the M5 gate
```

Anything less is not a readiness decision. It is just a diary with ambitions.
