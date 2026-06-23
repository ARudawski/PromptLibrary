# Dispatcher and Role Learning Setup

Status: proposed operating setup  
Last updated: 2026-06-23
Scope: Project Prompt Library Codex/Linear/GitHub workflow

This document designs the lightweight dispatcher setup and the role-learning loop for Project Prompt Library. It keeps runtime state in Linear/GitHub and keeps execution threads disposable.

Adoption note: this setup remains proposed until a coordinator/human adoption gate confirms that the current-state ledger, Linear queue, and handoff consumer are ready for it.

This document is not an executable dispatcher prompt. Use
[`docs/agents/dispatcher.md`](../agents/dispatcher.md) as the single canonical
dispatcher prompt/spec.

## Design principles

- Keep durable guidance in repo docs, not repeated long prompts.
- Convert repeated, stable workflows into small role specs.
- Use scheduled runs only after the manual workflow is predictable.
- Keep one thread per coherent unit of work.
- Keep agents small, state-light, and evidence-driven.
- Use Linear and GitHub for queue state, reports, claims, and learning decisions.
- Keep AI Automation Expert handoffs manual-only unless a later adoption gate
  changes the ledger, queue contract, dispatcher routing, and Linear labels.

## Current assumptions

Repository:

- `AGENTS.md` defines repository-wide guardrails.
- `docs/workflows/current-state-ledger.md` is the compact phase/gate/queue/caveat pointer.
- `docs/agents/README.md` defines the shared queue contract.
- Role specs live in `docs/agents/`.
- CI evidence rules live in `docs/qa/ci-evidence.md`.

Linear:

- Project: `Project Prompt Library`.
- Labels exist for `agent:codex-local`, `agent:review`, `agent:qa-local`, `agent:coordinator`, `agent:auto`, and `gate:manual`.
- Linear state is workflow position, not proof that an agent is currently running.
- A live claim marker is the active-work lock.
- `In Review` Coding Agent work and Coordinator docs/workflow PR work are
  review-ready handoff states.
- `In Progress` Coding Agent work and Coordinator docs/workflow PR work may be
  fix-ready handoff states when review has requested changes and no live claim
  exists.
- `Todo` is preferred for executable work, but the top unblocked matching Backlog item may be promoted/executed when no matching executable Todo exists and the current queue rule permits it.

GitHub:

- Repository: `ARudawski/PromptLibrary`.
- Dispatcher preflight may read recent/open PR metadata only: number, title, state, draft state, base/head branch, merged/closed timestamps, and visible Linear issue links.
- Dispatcher preflight must not read PR diffs, CI logs, PR comments, review threads, source files, or broad repo docs before handoff.

## Canonical source map

Use this map when changing or reviewing dispatcher/learning workflow docs.
Active rules must live in exactly one canonical file.

| Rule family | Canonical destination |
|---|---|
| Dispatcher operating modes, cheap preflight, decision taxonomy, drift handling, selection order, handoff payloads, claim-mode mechanics, handoff-consumer obligations, failure recovery, and role-thread reasoning settings | [`docs/agents/dispatcher.md`](../agents/dispatcher.md) |
| Current phase, active lane, queue exposure, and caveats | [`docs/workflows/current-state-ledger.md`](./current-state-ledger.md) |
| Shared queue contract, live role claim marker, and terminal claim markers | [`docs/agents/README.md`](../agents/README.md) |
| Role-specific execution and reporting obligations | The matching role spec in [`docs/agents/`](../agents/) |
| Reviewed workflow-learning decisions | [`docs/agents/learning-log.md`](../agents/learning-log.md) |

## Dispatcher adoption rationale

Candidate mode remains the default because it lets the dispatcher identify one
safe handoff without owning the Linear issue or stranding work in a claimed
state. Claim mode remains off until a coordinator/human adoption gate proves a
handoff consumer can accept exactly one claimed handoff, establish a fresh
role-run claim, recover failures, and preserve candidate mode as fallback.

The design intent is stable even though the executable mechanics are centralized
in the dispatcher spec:

- the dispatcher stays a cheap queue worker, not a project reasoning hub;
- cheap preflight stays limited to the current-state ledger, Linear queue/claim
  metadata, and recent/open PR metadata;
- live claim markers are the active-work lock, not Linear state alone;
- review-ready and fix-ready repository work remains routeable without a
  separate reviewer issue;
- explicitly targeted AI Automation Expert work remains manual-only and is not
  made recurring automation-pickable;
- State Checkpoint gaps route to repair instead of being hidden as ordinary
  caveats when they affect handoff selection or state-changing closeout.

For the executable decision flow, use
[`docs/agents/dispatcher.md#dispatcher-prompt`](../agents/dispatcher.md#dispatcher-prompt).

## Dry-run scenario matrix

Use this matrix as a lightweight review aid before changing the dispatcher
prompt or adopting claim mode. These are expected dry-run outcomes, not an
automated harness or a second executable spec. If the matrix and
[`docs/agents/dispatcher.md`](../agents/dispatcher.md) disagree, update the
matrix or the dispatcher spec explicitly instead of treating both as active
truth.

| Scenario | Expected dispatcher output | Why |
|---|---|---|
| No executable Project Prompt Library issue exists after checking review-ready, fix-ready, Todo, and allowed Backlog fallback states. | `DONT_NOTIFY` | The dispatcher has no useful handoff to emit and should not wake a role agent. |
| A candidate issue has a live `AGENT RUNNING` or `DISPATCHER CLAIM RUNNING` marker with no later terminal marker and an unexpired `claim_expires_at`. | `CLAIM_BLOCKED` | Live claim markers are the active-work lock; Linear state alone is not. |
| A QA Agent role run has `AGENT RUNNING` with a `claim_id`, then posts a QA report ending with `AGENT COMPLETE` for the same `claim_id`. | The next dispatcher pass does not treat that claim as live; selection continues normally. | This covers the PL-104 terminal-marker incident: `QA COMPLETE` may be human-readable status, but only `AGENT COMPLETE` is the successful machine terminal marker. |
| A Done or Canceled issue still has `agent:auto`. | `DONT_NOTIFY` when no other candidate exists; otherwise ignore that issue and continue selection. | `agent:auto` grants automation permission only for otherwise executable issues; terminal states are never executable. |
| A current coordinator gate is in Backlog, no matching executable Todo exists, it is top unblocked for the current lane, has `agent:coordinator`, and has the required Coordinator Agent/Coordinator Report marker. | `ROLE_HANDOFF_CANDIDATE` in candidate mode, or `ROLE_HANDOFF` only after adopted claim mode claims it. | PL-64 aligns the active policy to Todo first plus top-unblocked matching Backlog fallback; coordinator gates are eligible only under the normal role, blocker, lane, and claim checks. |
| Multiple executable candidates remain after applying current lane, role label/title marker, blocker/dependency, roadmap/ledger order, and issue-order tiebreakers. | `AMBIGUOUS_QUEUE` | The dispatcher must select at most one candidate; unresolved ambiguity needs coordinator or human queue repair. |
| A Coding Agent issue, Coordinator docs/workflow issue, or AI Automation Expert repo-mutating workflow-doc issue is in `In Review` with an attached or clearly linked PR. | `ROLE_HANDOFF_CANDIDATE` for the Review Agent in candidate mode. | `In Review` repository work is review-ready handoff state even when there is no separate review issue. |
| A Coding Agent issue, Coordinator docs/workflow issue, or AI Automation Expert repo-mutating workflow-doc issue is in `In Progress`, has requested-changes or fix-needed evidence, and has no live claim. | `ROLE_HANDOFF_CANDIDATE` for the owning Coding, Coordinator, or AI Automation Expert role in candidate mode. | `In Progress` can be fix-ready handoff state; the dispatcher should not treat the state itself as a lock. |
| A human or Coordinator Agent explicitly targets an exact issue whose title/body names `AI Automation Expert`, and no live claim or active role-agent thread exists. | `ROLE_HANDOFF_CANDIDATE` for the AI Automation Expert in candidate mode. | The role is manual-only, so explicit targeting is required. This does not add `agent:auto`, adopt claim mode, or make the role recurring automation-pickable. |
| An AI Automation Expert issue is merely visible in Todo/Backlog or has `agent:auto` without explicit human/coordinator targeting. | `STATE_DRIFT_DETECTED` when it is the only visible candidate; otherwise skip it and carry queue exposure drift in the selected handoff. | `agent:auto` is not valid permission for this manual-only role under the current ledger, and silent no-op would hide unsafe exposure. |
| The current-state ledger is stale versus live Linear/GitHub, and the mismatch would change the selected role, issue, lane, dependency, or blocker status. | `STATE_DRIFT_DETECTED` | PL-63 makes blocking drift explicit instead of allowing a handoff from contradictory operating state. |
| The current-state ledger is stale versus live Linear/GitHub, but exactly one candidate remains, the drift is tracked by PL-60 or explained by PL-62-style workflow rules, and it does not change the handoff. | `ROLE_HANDOFF_CANDIDATE` with `<state_caveat>` in candidate mode. | PL-63 allows known, tracked, non-blocking drift to proceed only after candidate selection proves the selected handoff is unaffected. |
| State Checkpoint evidence is missing or stale, and that gap would change the selected role, issue, lane, dependency, blocker status, repair path, or current state-changing handoff. | `STATE_DRIFT_DETECTED` | PL-83 requires `No slice handoff without a State Checkpoint`; missing checkpoint evidence becomes a state-repair routing signal when it affects selection or would let a state-changing handoff proceed without an approved checkpoint. |
| A non-automated monitor finding reports missing checkpoint evidence but no executable state-repair issue is linked or selectable, no open review-ready PR can safely carry the narrow Review Agent checkpoint-doc amendment, or the repair needs repo mutation without explicit workflow/docs edit authorization. | `STATE_DRIFT_DETECTED` | Findings preserve evidence but are not role work. The repair must be converted into a Coordinator Agent state-repair issue that authorizes the needed mutation or carried by the narrow review-ready PR amendment path before handoff. |
| A `gate:manual` issue is visible but the selected role is not a permitted coordinator/human gate path, or the run lacks coordinator authority. | `DONT_NOTIFY` when no other candidate exists; otherwise skip that issue. | `gate:manual` requires human/coordinator decision authority and must not be executed by an ordinary Coding, Review, or QA handoff. |

## Suggested settings

The setup-level recommendation is to keep the dispatcher inexpensive and keep
role execution in fresh issue-scoped threads. The canonical role-thread
`thinking` values and handoff-consumer obligation to pass them live in
[`docs/agents/dispatcher.md#dispatcher-prompt`](../agents/dispatcher.md#dispatcher-prompt)
and are summarized in
[`docs/agents/dispatcher.md#setup-notes`](../agents/dispatcher.md#setup-notes).

## Claim and handoff-consumer references

Claim mode remains off until the consumer contract is proven and explicitly
adopted. The canonical claim lifecycle, accepted-handoff transition, terminal
markers, consumer obligations, and failure recovery behavior live in:

- [`docs/agents/dispatcher.md#dispatcher-prompt`](../agents/dispatcher.md#dispatcher-prompt)
- [`docs/agents/dispatcher.md#setup-notes`](../agents/dispatcher.md#setup-notes)
- [`docs/agents/README.md#claim-terminal-markers`](../agents/README.md#claim-terminal-markers)

Setup guidance that still matters for adoption:

- candidate-mode handoffs create no `claim_id`, and role runs started from
  `ROLE_HANDOFF_CANDIDATE` must not invent claim lifecycle markers;
- claim-mode proof must verify ownership transfer from dispatcher claim to
  role-run claim before heavy work;
- candidate mode must remain available as fallback after any claim-mode proof
  or partial adoption.

## Claim-mode proof checklist

Use this checklist before moving from candidate mode to any claim-mode adoption.

1. Candidate baseline: run the dispatcher in candidate mode and verify it emits exactly one `ROLE_HANDOFF_CANDIDATE`, creates no `claim_id`, and mutates no Linear state.
2. Manual proof authorization: record explicit coordinator/human approval naming the issue, role, consumer, claim expiry window, and that this is a bounded proof, not recurring adoption.
3. Dispatcher claim: run claim mode manually and verify it writes exactly one `DISPATCHER CLAIM RUNNING` marker, records `claimed_from_state` and `claimed_from_labels`, moves only the selected issue as allowed, and emits `ROLE_HANDOFF`.
4. Consumer acceptance: verify the consumer re-fetches the issue/comments, rejects already accepted or already running handoffs for the same `claim_id`, re-checks current executability against the `claim_rule`, posts `DISPATCHER HANDOFF ACCEPTED` plus `AGENT RUNNING` in one Linear comment, then re-fetches again so only the first consumer proceeds.
5. Role completion: verify the fresh role run follows the full role spec, posts normal evidence, and ends with exactly one terminal marker for the same `claim_id`.
6. Failure dry-runs: table-check missed pickup, expired claim, duplicate acceptance, duplicate claim, interrupted role run, and role-run refusal against the required terminal, release, or repair behavior.
7. Fallback check: verify candidate mode still works after the proof and that stale or failed claims restore or repair queue state instead of stranding Todo/Backlog work in `In Progress`.
8. Adoption decision: claim mode may be partially adopted only after the proof evidence is reviewed and a coordinator/human decision names the allowed roles, lanes, expiry window, and rollback rule.

Recommendation: keep claim mode off for recurring automation until the manual proof above passes. After proof, adopt claim mode only for the narrow role/lane named in the adoption decision; keep candidate mode as the default fallback.

## Queue exposure rationale

The executable queue-selection order lives in
[`docs/agents/dispatcher.md#dispatcher-prompt`](../agents/dispatcher.md#dispatcher-prompt).
The shared role/label contract lives in
[`docs/agents/README.md#queue-selection-contract`](../agents/README.md#queue-selection-contract).

This setup doc keeps only exposure examples for review and adoption planning.
If an example conflicts with the canonical dispatcher or shared queue contract,
fix the relevant canonical file and update the example in the same PR.

## Recommended issue exposure

Keep only the currently intended lane exposed with `agent:auto`.

Example:

```text
Current coordinator gate ready:
  state: Todo or top unblocked Backlog item
  labels: agent:coordinator, agent:auto

Next coding issue waiting behind gate:
  state: Backlog
  labels: agent:codex-local
  no agent:auto

Coding issue ready for review:
  state: In Review
  labels: agent:codex-local
  linked PR present

Coordinator docs/workflow issue ready for review:
  state: In Review
  labels: agent:coordinator
  linked PR present

AI Automation Expert workflow-doc issue ready for review:
  state: In Review
  labels: gate:manual
  linked PR present

Coding issue needing review fixes:
  state: In Progress
  labels: agent:codex-local
  review requested changes present
  no live claim present

Coordinator docs/workflow issue needing review fixes:
  state: In Progress
  labels: agent:coordinator
  review requested changes present
  no live claim present

AI Automation Expert workflow-doc issue needing review fixes:
  state: In Progress
  labels: gate:manual
  review requested changes present
  no live claim present

AI Automation Expert issue:
  state: Todo or Backlog only when explicitly targeted by a human or Coordinator Agent
  labels: gate:manual
  no agent:auto
  no recurring automation label
```

## Role learning model

Agents do not learn privately. The project learns through reviewed artifacts.

Default loop:

```text
agent run
  -> report includes Learning candidates only when a real candidate exists
  -> coordinator filters candidates
  -> accepted learning becomes a small docs/workflow PR or explicit Linear update
  -> active rule goes into exactly one canonical file
  -> learning-log records the decision
```

## Automation incident / learning candidate format

Use this only for automation mistakes, near-misses, bad handoffs, stale-state decisions, duplicate claims, wrong-worktree attempts, unsafe selections, or similar evidence that may change workflow behavior. Do not turn every harmless hiccup into a ticket or learning entry.

Immediate incident evidence belongs in a Linear comment on the affected issue or run. Reviewed durable learning belongs in `docs/agents/learning-log.md`. Active role or workflow rules change only after coordinator/human adoption and must live in exactly one canonical file.

```text
Automation incident / learning candidate
Kind: incident | near-miss | bad handoff | stale-state | duplicate claim | wrong worktree | unsafe selection
Observed:
Impact:
Immediate action:
Affected role/spec:
Proposed change:
Confidence: low | medium | high
Routing: Linear evidence now; learning-log only after review; role/spec update only after adoption
```

Compact examples:

| Example | Immediate evidence | Possible durable target |
|---|---|---|
| Stale ledger conflicts with live Linear/GitHub but the selected workflow issue is explicit and safe. | Linear comment with ledger summary, live evidence, and why it is non-blocking or blocking. | `docs/workflows/current-state-ledger.md` for state facts, or dispatcher/coordinator docs for routing policy. |
| Agent starts in the wrong worktree or wrong clone. | Linear run comment naming the observed path, branch, and stopped/resumed action. | The relevant role spec if this repeatedly causes unsafe work. |
| Duplicate live claim or unexpired claim blocks selection. | Linear comment naming both claim IDs, expiry times, and chosen terminal/release action. | Dispatcher or handoff-consumer claim lifecycle docs after review. |
| Queue is ambiguous after applying role, lane, blocker, and ordering rules. | Linear comment listing candidates and the unresolved tie. | Shared queue rules in `docs/agents/README.md` or dispatcher docs. |
| Backlog item would be picked without matching lane, title marker, blocker, or `agent:auto` guardrails. | Linear comment naming the unsafe candidate and skipped reason. | Linear operating model or shared queue docs after coordinator/human decision. |
| PR body or role report links non-goal issues through negated closing wording, as in PL-71. | Repair the affected Linear states, then comment with the PR, issue IDs, timestamps, and restored state. | Coding and review docs for issue-reference rules. |

## PR and report issue-reference safety

Reserve closing or implementation words for the issue a PR, role report, Linear
comment, or GitHub fallback comment is meant to advance. Do not put non-goal
issue IDs next to words such as `close`, `fix`, `resolve`, `complete`, or
`implement`, even in negated phrases. Integrations may not understand the
negation.

Unsafe:

```text
This does not close PL-60 or implement PL-67.
```

Safer:

```text
Context only: PL-60, PL-67. No lifecycle action requested for these issues.
```

## Learning candidates section

Learning-candidate reporting is opt-in. Add this section to role reports only
when the run observes an actual automation incident, near-miss, repeated
friction, evidence gap, wrong-worktree event, duplicate claim, stale-state
decision, unsafe selection, or workflow-learning task that may change future
workflow behavior:

```text
Learning candidates:
- candidate:
  evidence:
  affected role/spec:
  proposed change:
  confidence:
  apply now? yes/no
```

If there is no useful learning, omit the section. Ordinary Coding, Review, QA,
Coordinator, and AI Automation Expert reports do not need a no-op
`Learning candidates: none` line.

## Learning acceptance bar

A learning candidate should meet at least one condition:

- repeated friction happened at least twice;
- blocking failure or incorrect gate decision;
- repeated token waste or idle polling waste;
- scope/safety drift risk;
- evidence gap that prevented review, QA, or coordinator decision;
- setup mismatch such as wrong worktree, stale state, or missing label.

Do not encode one-off confusion unless it caused real failure.

## Where accepted learnings go

| Learning type | Canonical target |
|---|---|
| Current phase/gate/caveat changed | `docs/workflows/current-state-ledger.md` |
| Shared queue/review rule changed | `docs/agents/README.md` |
| Coding behavior changed | `docs/agents/coding-agent.md` |
| Review behavior changed | `docs/agents/review-agent.md` |
| QA behavior changed | `docs/agents/qa-agent.md` |
| Coordinator behavior changed | `docs/agents/coordinator-agent.md` |
| Dispatcher behavior changed | `docs/agents/dispatcher.md` |
| CI/check evidence changed | `docs/qa/ci-evidence.md` |
| Project-wide hard boundary changed | `AGENTS.md` |
| PR evidence shape changed | `.github/pull_request_template.md` |
| Issue format changed | Linear issue template or coordinator prompt |

Use `docs/agents/learning-log.md` as a compact audit trail. Active rules must be copied into the canonical file above.

## Compaction rule

At the end of each milestone, run a small workflow compaction:

1. Read `docs/agents/learning-log.md`.
2. Remove or merge duplicate active rules.
3. Ensure each active rule lives in one canonical place.
4. Shorten role specs where possible.
5. Update `docs/workflows/current-state-ledger.md`.
6. Open one docs PR.

## Anti-bloat rules

- Do not add a rule unless it prevents repeated friction, real failure, or real ambiguity.
- Do not copy the same rule into every role spec.
- Put shared rules in `docs/agents/README.md`.
- Put phase facts in the ledger.
- Put role-specific behavior in the role file.
- Put history in the learning log, not in active prompts.
- Prefer deleting obsolete text over appending caveats forever.

## Historical initial rollout

This is a completed setup record, not active instructions for future agents:

- `docs/agents/dispatcher.md` was added as the dispatcher prompt/spec.
- This setup document was added for design rationale, proof guidance, dry-run
  review aids, role-learning notes, and historical context.
- `docs/agents/learning-log.md` was added as the reviewed learning audit log.
- The documents were linked from the repository docs and agent index.

Do not add these files again. Current changes should edit the existing
canonical files through the normal branch/PR/review workflow. Candidate mode
remains the default unless a later coordinator/human adoption gate proves and
adopts claim mode.
