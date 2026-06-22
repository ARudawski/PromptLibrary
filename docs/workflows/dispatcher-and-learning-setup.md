# Dispatcher and Role Learning Setup

Status: proposed operating setup  
Last updated: 2026-06-22
Scope: Project Prompt Library Codex/Linear/GitHub workflow

This document designs the lightweight dispatcher setup and the role-learning loop for Project Prompt Library. It keeps runtime state in Linear/GitHub and keeps execution threads disposable.

Adoption note: this setup remains proposed until a coordinator/human adoption gate confirms that the current-state ledger, Linear queue, and handoff consumer are ready for it.

## Design principles

- Keep durable guidance in repo docs, not repeated long prompts.
- Convert repeated, stable workflows into small role specs.
- Use scheduled runs only after the manual workflow is predictable.
- Keep one thread per coherent unit of work.
- Keep agents small, state-light, and evidence-driven.
- Use Linear and GitHub for queue state, reports, claims, and learning decisions.

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

## Dispatcher modes

Default until adoption: candidate mode.

```text
candidate mode:
  cheap preflight: Linear + current-state ledger + recent PR metadata only
  select one candidate
  emit ROLE_HANDOFF_CANDIDATE
  do not mutate Linear
  stop
```

Adopted only after explicit coordinator/human approval: claim mode.

```text
claim mode:
  cheap preflight: Linear + current-state ledger + recent PR metadata only
  select one candidate
  write DISPATCHER CLAIM RUNNING with claim_id and claim_expires_at
  verify unique claim ownership
  emit ROLE_HANDOFF
  stop
```

Use claim mode only when a handoff consumer exists and is expected to start a fresh role run from `ROLE_HANDOFF`. Without that consumer, candidate mode is safer because it cannot strand a Linear issue in a claimed state.

## Dispatcher model

```text
Dispatcher
  -> cheap preflight: Linear + current-state ledger + recent PR metadata only
  -> compare ledger, Linear queue, live claims, and recent PR state for hard blockers and provisional drift notes
  -> if a live claim exists: stop
  -> if hard state drift blocks candidate selection: stop
  -> if review-ready In Review coding or coordinator docs/workflow PR work exists: select review handoff
  -> if fix-ready In Progress coding or coordinator docs/workflow PR work exists: select owning-role handoff
  -> else if matching executable Todo exists: select it
  -> else if no matching executable Todo exists: select top matching Backlog when allowed
  -> after exactly one candidate is selected: finalize provisional drift as blocking or non-blocking caveat
  -> if post-selection blocking drift exists: stop
  -> candidate mode: emit ROLE_HANDOFF_CANDIDATE and stop
  -> claim mode: claim, emit ROLE_HANDOFF, and stop

Fresh role run
  -> candidate mode: starts from ROLE_HANDOFF_CANDIDATE without claim markers
  -> claim mode: accepts ROLE_HANDOFF and posts AGENT RUNNING
  -> reads role spec and issue context
  -> executes exactly one role workflow
  -> writes evidence, plus terminal claim marker when a claim_id exists
```

The dispatcher is a queue worker, not a reasoning hub. It should not build project understanding unless it has selected work. The only repo file it may read before handoff is `docs/workflows/current-state-ledger.md`, because the ledger is required to avoid stale Linear labels pulling later-slice work. Recent GitHub PR metadata is allowed only as a cheap drift signal, not as review evidence.

## State-drift preflight

The dispatcher must compare three cheap signals before selecting work:

1. `docs/workflows/current-state-ledger.md` for current phase, gate, next lane, queue rule, and caveats.
2. Linear queue state for active candidates, blockers, labels, comments, and live claim markers.
3. Recent/open GitHub PR metadata for whether a linked issue was recently merged, closed, opened, or still active.

Phase 1 drift classification is provisional unless the mismatch prevents safe candidate selection. Use `STATE_DRIFT_DETECTED` before selection only for hard blockers, such as a candidate set that cannot be formed safely, a later slice or gate appearing complete with no explicit target or repair path, unavailable cheap metadata needed to build the candidate set, or stale labels/states that expose multiple plausible lanes before ordering rules can be applied.

Carry provisional drift notes into candidate selection when the final decision depends on which issue is selected, whether exactly one candidate remains, or whether the selected issue is the tracked repair/workflow handoff. After selection, use `STATE_DRIFT_DETECTED` and stop if the drift would change the selected lane, role, issue, dependency, or blocker decision.

Treat drift as a non-blocking caveat only after exactly one candidate remains and the mismatch does not change that handoff. PL-60 is the concrete repair path for stale current-state ledger/status docs. PL-62 is the workflow rule requiring coordinator closeouts to surface, update, link, or block on documentation/state drift. A dispatcher handoff may proceed with a `<state_caveat>` only when the drift is known, tracked, and irrelevant to the selected role/issue, or when the selected issue itself is the repair/workflow handoff.

Machine-readable dispatcher decisions:

```text
DONT_NOTIFY
CLAIM_BLOCKED
STATE_DRIFT_DETECTED
AMBIGUOUS_QUEUE
ROLE_HANDOFF_CANDIDATE
ROLE_HANDOFF
```

## Dry-run scenario matrix

Use this matrix as a lightweight review aid before changing the dispatcher prompt or adopting claim mode. These are expected dry-run outcomes, not an automated harness.

| Scenario | Expected dispatcher output | Why |
|---|---|---|
| No executable Project Prompt Library issue exists after checking review-ready, fix-ready, Todo, and allowed Backlog fallback states. | `DONT_NOTIFY` | The dispatcher has no useful handoff to emit and should not wake a role agent. |
| A candidate issue has a live `AGENT RUNNING` or `DISPATCHER CLAIM RUNNING` marker with no later terminal marker and an unexpired `claim_expires_at`. | `CLAIM_BLOCKED` | Live claim markers are the active-work lock; Linear state alone is not. |
| A Done or Canceled issue still has `agent:auto`. | `DONT_NOTIFY` when no other candidate exists; otherwise ignore that issue and continue selection. | `agent:auto` grants automation permission only for otherwise executable issues; terminal states are never executable. |
| A current coordinator gate is in Backlog, no matching executable Todo exists, it is top unblocked for the current lane, has `agent:coordinator`, and has the required Coordinator Agent/Coordinator Report marker. | `ROLE_HANDOFF_CANDIDATE` in candidate mode, or `ROLE_HANDOFF` only after adopted claim mode claims it. | PL-64 aligns the active policy to Todo first plus top-unblocked matching Backlog fallback; coordinator gates are eligible only under the normal role, blocker, lane, and claim checks. |
| Multiple executable candidates remain after applying current lane, role label/title marker, blocker/dependency, roadmap/ledger order, and issue-order tiebreakers. | `AMBIGUOUS_QUEUE` | The dispatcher must select at most one candidate; unresolved ambiguity needs coordinator or human queue repair. |
| A Coding Agent issue or Coordinator docs/workflow issue is in `In Review` with an attached or clearly linked PR. | `ROLE_HANDOFF_CANDIDATE` for the Review Agent in candidate mode. | `In Review` repository work is review-ready handoff state even when there is no separate review issue. |
| A Coding Agent issue or Coordinator docs/workflow issue is in `In Progress`, has requested-changes or fix-needed evidence, and has no live claim. | `ROLE_HANDOFF_CANDIDATE` for the owning Coding or Coordinator Agent in candidate mode. | `In Progress` can be fix-ready handoff state; the dispatcher should not treat the state itself as a lock. |
| The current-state ledger is stale versus live Linear/GitHub, and the mismatch would change the selected role, issue, lane, dependency, or blocker status. | `STATE_DRIFT_DETECTED` | PL-63 makes blocking drift explicit instead of allowing a handoff from contradictory operating state. |
| The current-state ledger is stale versus live Linear/GitHub, but exactly one candidate remains, the drift is tracked by PL-60 or explained by PL-62-style workflow rules, and it does not change the handoff. | `ROLE_HANDOFF_CANDIDATE` with `<state_caveat>` in candidate mode. | PL-63 allows known, tracked, non-blocking drift to proceed only after candidate selection proves the selected handoff is unaffected. |
| A `gate:manual` issue is visible but the selected role is not a permitted coordinator/human gate path, or the run lacks coordinator authority. | `DONT_NOTIFY` when no other candidate exists; otherwise skip that issue. | `gate:manual` requires human/coordinator decision authority and must not be executed by an ordinary Coding, Review, or QA handoff. |

## Suggested settings

Dispatcher:

```text
reasoning: low or medium
GitHub/repo access before handoff: current-state ledger plus recent PR metadata only
Linear access before handoff: yes
role execution in dispatcher run: no
```

Fresh role execution after handoff:

```text
coding: medium/high depending on issue complexity
review: medium/high
QA: medium/high when runtime/project-state viability matters
coordinator: medium unless gate is ambiguous
```

## Claim lifecycle

A live claim is one of these markers without a later terminal marker for the same `claim_id` and with `claim_expires_at` still in the future:

```text
DISPATCHER CLAIM RUNNING
claim_id:
claim_expires_at:
role:
issue:
claim_rule:
claimed_from_state:
claimed_from_labels:
```

```text
AGENT RUNNING
claim_id:
claim_expires_at:
role:
issue:
```

Claim-mode handoff transition marker:

```text
DISPATCHER HANDOFF ACCEPTED
claim_id:
accepted_at:
consumer:
```

`DISPATCHER HANDOFF ACCEPTED` is not a terminal marker by itself. In claim mode, the handoff consumer must post it together with `AGENT RUNNING` before doing heavy work so ownership moves from dispatcher claim to role-run claim without a lock gap.

Terminal markers:

```text
AGENT COMPLETE
claim_id:
completed_at:
result:
```

```text
AGENT BLOCKED
claim_id:
blocked_at:
reason:
```

```text
AGENT CLAIM RELEASED
claim_id:
released_at:
reason:
```

```text
AGENT CLAIM EXPIRED
claim_id:
observed_at:
reason:
```

Candidate-mode handoffs do not create a `claim_id`; fresh role runs started from `ROLE_HANDOFF_CANDIDATE` must not invent claim lifecycle markers.

In claim mode, the handoff consumer must post `DISPATCHER HANDOFF ACCEPTED` and `AGENT RUNNING` in the same Linear comment before the fresh role run performs heavy work. `AGENT RUNNING` is mandatory for claim-mode role runs, and the role run must end with a terminal marker.

## Handoff consumer contract

Claim mode remains off until this contract is proven and explicitly adopted by a coordinator or human decision. The consumer is a small bridge between `ROLE_HANDOFF` and a fresh role-agent run; it is not a scheduler and it does not select work.

Allowed consumer actions:

- Read exactly one dispatcher `ROLE_HANDOFF` result.
- Re-fetch the selected Linear issue and comments.
- Verify the dispatcher claim is live: the `DISPATCHER CLAIM RUNNING` marker exists, `claim_expires_at` is in the future, no earlier unexpired live claim owns the issue, and no terminal marker exists for the same `claim_id`.
- Reject the handoff if comments already contain `DISPATCHER HANDOFF ACCEPTED` or `AGENT RUNNING` for the same `claim_id`; the first accepted/running consumer owns the role run.
- Verify current executability still satisfies the `claim_rule`, not just the static handoff fields: issue state is still eligible, blockers are still resolved, review-ready or fix-ready evidence still exists when required, and any linked PR is still open and ready for that rule.
- Verify the handoff still matches the issue, role, claim rule, linked PR, and state caveat.
- Post one combined acceptance/running comment before heavy work:

```text
DISPATCHER HANDOFF ACCEPTED
claim_id:
accepted_at:
consumer:

AGENT RUNNING
claim_id:
claim_expires_at:
role:
issue:
```

- Start one fresh role-agent run for that issue and role, using the supplied `claim_id`.
- End the run with exactly one terminal marker for the same `claim_id`: `AGENT COMPLETE`, `AGENT BLOCKED`, `AGENT CLAIM RELEASED`, or `AGENT CLAIM EXPIRED`.

After posting the combined acceptance/running comment, the consumer must re-fetch the Linear issue and comments. It may proceed only if its own combined marker is the first one for that `claim_id` and current executability still satisfies the `claim_rule`. If another consumer accepted first, stop before heavy work and do not post a terminal marker for the shared `claim_id`; the winning role run owns completion.

Forbidden consumer actions:

- Do not consume `ROLE_HANDOFF_CANDIDATE` as a claim-mode run.
- Do not invent or change a `claim_id`.
- Do not select a different issue, role, PR, or lane.
- Do not start parallel active lanes.
- Do not activate claim mode by documentation alone.
- Do not remove candidate mode or make it unavailable as fallback.
- Do not require cloud infrastructure.
- Do not change product runtime behavior.

Failure handling:

| Case | Required behavior |
|---|---|
| Missed handoff pickup | If `claim_expires_at` passes before the combined acceptance/running comment exists, do not start heavy work. Before posting `AGENT CLAIM EXPIRED`, restore any state or label mutation recorded in `claimed_from_state` or `claimed_from_labels`; if safe restoration is not possible, post an explicit repair/blocker note so the issue is not stranded as ordinary `In Progress`. |
| Expired claim | The consumer must refuse the handoff. Before posting `AGENT CLAIM EXPIRED`, restore any state or label mutation recorded in `claimed_from_state` or `claimed_from_labels`; if humans or another agent changed the issue and restoration would be unsafe, post `AGENT BLOCKED` or a repair note that makes the stranded state explicit, then stop. |
| Duplicate claims | The earliest unexpired live claim for the issue wins. Later claimants post `AGENT CLAIM RELEASED` for their own `claim_id` when possible, return `CLAIM_BLOCKED`, and stop. |
| Interrupted role run | Resume only when the same `claim_id` is still unexpired and no terminal marker exists. If expiry passed, post `AGENT CLAIM EXPIRED` or `AGENT BLOCKED` with the interruption reason and stop. |
| Role-run refusal | If the fresh role run refuses due to title, role, blocker, architecture, or evidence mismatch, post `AGENT CLAIM RELEASED` before heavy work or `AGENT BLOCKED` after acceptance, then stop. |

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

## Queue rules

The dispatcher stops when a live claim exists. It does not stop merely because an issue is `In Progress` or `In Review`.

Selection order:

1. Review-ready `In Review` Coding Agent issue or Coordinator docs/workflow
   issue with linked PR/review target.
2. Fix-ready `In Progress` Coding Agent issue or Coordinator docs/workflow
   issue with requested-changes/fix-needed evidence and no live claim.
3. Matching executable `Todo` issue.
4. Top unblocked matching Backlog issue when no matching executable `Todo` exists and the current queue rule permits it.

Completion routing happens in the fresh role run, not in the dispatcher:

- Coding work ends in `In Review`, not `Done`.
- Coordinator docs/workflow repository mutation ends in `In Review` after a PR
  is opened, not `Done`.
- Review work either returns the target issue to `In Progress`, approves/merges
  and moves it to `Done`, or records `BLOCKED`.
- QA work moves the QA issue to `Done` only after a PASS/PASS WITH MINOR ISSUES verdict.
- Coordinator gates move to `Done` only after the decision is recorded.

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
```

## Role learning model

Agents do not learn privately. The project learns through reviewed artifacts.

Default loop:

```text
agent run
  -> report includes Learning candidates
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

Add this section to role reports when useful:

```text
Learning candidates:
- candidate:
  evidence:
  affected role/spec:
  proposed change:
  confidence:
  apply now? yes/no
```

If there is no useful learning, write:

```text
Learning candidates: none
```

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

## Initial rollout

1. Add `docs/agents/dispatcher.md`.
2. Add this setup document.
3. Add `docs/agents/learning-log.md`.
4. Link the documents from `docs/README.md` and `docs/agents/README.md`.
5. Start in candidate mode.
6. Review the first dispatcher candidates before adopting claim mode.
7. Adopt claim mode only after the handoff consumer contract is manually proven and accepted by coordinator/human evidence.
