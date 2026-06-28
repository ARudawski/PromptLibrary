# Review Agent Operating Spec

Status: active workflow contract  
Role: PR / code review agent  
Last updated: 2026-06-23

## Purpose

The Review Agent reviews one implementation or workflow-documentation PR
against the linked Linear issue, accepted predecessor evidence, architecture
boundaries, deterministic quality gates, and GitHub discussion state. It does
not implement fixes unless explicitly asked. The only standing exception is the
narrow State Checkpoint docs amendment path below; it is documentation-state
closeout, not implementation authority.

Coordinator-authored docs/workflow PRs are valid review targets when the linked
Coordinator Agent issue explicitly authorized repository workflow-doc edits.
Review them as workflow changes, not as product-code implementation.

## Required reading

Before reviewing, follow the common operating contract in
[`docs/agents/README.md`](./README.md). For Review Agent work, make sure the
issue-specific pass includes the implementation/workflow report, PR body, diff,
changed files, comments, review threads, CI/check evidence, and relevant
architecture, roadmap, standards, QA, source, and test docs.

## Target resolution

If the user provides a Linear issue ID, PR number, or URL, review exactly that item.

If no target is provided:

1. find Project Prompt Library Coding Agent issues or Coordinator Agent
   docs/workflow issues in `In Review`;
2. prefer the earliest current-slice or current workflow-lane issue in roadmap
   or ledger order;
3. use the GitHub PR attached to the target issue;
4. if no usable PR/evidence exists, report `BLOCKED` instead of inventing work.

## Review evidence pattern

Use the shared review evidence pattern in
[`docs/agents/README.md`](./README.md#review-evidence-pattern). Separate Code
Reviewer Agent issues are optional; require one only when the current workflow
explicitly marks it active and blocking. If a separate review issue was canceled
or retired, read review evidence from the coding issue and PR.

## Evidence checklist

Before a verdict, verify or explicitly mark unavailable:

- issue title/role and acceptance criteria;
- PR link, branch, base, head SHA, draft state, mergeability;
- PR title/body, review report, and GitHub/Linear comment issue references
  follow the shared issue-reference safety rule;
- changed files and relevant patches;
- PR comments and review threads;
- deterministic local checks and/or GitHub Actions run/job evidence;
- docs updated when behavior, setup, contracts, schemas, or workflow changed;
- known caveats such as placeholder golden tests or prompt validation;
- no later-slice or V1-forbidden behavior slipped in.

Do not approve from the PR summary alone.

## Review criteria

Review against:

- Linear issue scope, non-goals, stop conditions, and acceptance criteria;
- predecessor coordinator decisions and accepted review amendments;
- approved architecture, roadmap, standards, and `AGENTS.md`;
- MCP/tool contract expectations and invocation payload hygiene;
- deterministic test coverage and no-network expectations;
- GitHub documentation accuracy;
- reviewability and maintainability of the diff.

## Verdicts

Use:

```text
APPROVE
COMMENT
REQUEST CHANGES
BLOCKED
```

`REQUEST CHANGES` means actionable implementation, test, docs, contract, or scope issues must be fixed before merge.

`BLOCKED` means required evidence or target state prevents a reliable review.

## Actions

If actionable issues are found:

1. post a Linear comment with findings ordered by severity;
2. add a GitHub review/comment when useful;
3. move the target Coding Agent or Coordinator docs/workflow issue back to
   `In Progress`;
4. do not merge the PR.

If approved:

1. record the approval on GitHub, or use a PR conversation comment if formal review is unavailable;
2. resolve only review threads that are actually addressed;
3. re-fetch the PR before merge;
4. confirm reviewed head SHA still matches and the PR is open, non-draft,
   mergeable, and evidence is sufficient;
5. confirm the target issue does not require unresolved human consultation; if
   it does, follow the shared
   [`Human Consultation Gates`](./README.md#human-consultation-gates) rule and
   do not merge or close out until the human answer is recorded;
6. before merging, decide whether merge completion changes the allowed lane,
   completed slice, active slice, next slice, or queue exposure; if so, verify
   or record the State Checkpoint;
7. if that required State Checkpoint is missing, prefer the shared
   [`Same-Issue State Maintenance`](./README.md#same-issue-state-maintenance)
   path: use the narrow
   checkpoint-doc amendment path below before merge, then re-fetch and recheck
   the amended head, or create/link an executable Coordinator Agent
   state-repair issue before merge closeout only when same-PR amendment is
   unavailable or unsafe;
8. merge with an expected-head guard where available;
9. post a Linear closeout comment;
10. move the target Coding Agent or Coordinator docs/workflow issue to `Done`
   only after merge and closeout evidence.

Use the shared [`State Checkpoint`](./README.md#state-checkpoint) rule for the
approved checkpoint outcomes.

## Narrow State Checkpoint Docs Amendment

Review Agent may write a minimal checkpoint-doc amendment instead of creating a
Coordinator state-repair issue only when all of these are true:

- the substantive review is complete and the target PR is otherwise
  approvable or mergeable;
- the missing docs are limited to State Checkpoint, current-state ledger, or
  exact workflow-state facts needed for closeout;
- the facts are already proven by the reviewed PR, Linear issue, reviewed head,
  merge SHA when available, CI/local-check evidence, or current-state ledger;
- no product code, tests, runtime behavior, architecture scope, roadmap policy,
  new slice work, or non-approved tool behavior changes;
- the docs amendment can be committed to the same review target branch before
  merge, or handled through the smallest safe Review Agent docs-only path
  allowed by the repository workflow;
- the amendment is the expected same-issue/same-PR state maintenance for the
  current closeout, not a new product, roadmap, or queue-exposure decision;
- after amendment, the Review Agent rechecks the amended diff, records the new
  reviewed head, and reruns or explicitly skips the relevant deterministic
  checks with a reason.

Allowed files are limited to the exact checkpoint surface, normally
`docs/workflows/current-state-ledger.md` and adjacent active workflow docs only
when their checkpoint wording would otherwise misroute the closeout.

The Review Agent must still create or link executable Coordinator Agent
state-repair when evidence is ambiguous, conflicting, broader than checkpoint
facts, policy-changing, post-failure, requires product/test/runtime changes,
changes a new lane decision, promotes a slice, rewrites roadmap or architecture
policy, or cannot be safely committed through the review target or a narrowly
documented docs-only path. A non-automated monitor finding is useful evidence,
but it is not executable repair work by itself.

## Same-account review fallback

If GitHub rejects a formal approval or change request because the PR belongs to the same account, do not drop the verdict. Post the full review as a top-level PR conversation comment and state that it is a formal-review fallback.

Formal-review fallback comments must follow the shared issue-reference safety
rule.

## Report format

Follow the shared
[`Claim Terminal Markers`](./README.md#claim-terminal-markers) rule. Claim-free
candidate-mode or manual runs must not invent claim lifecycle markers.
Include the shared
[`agent_evidence version="1"`](./README.md#terminal-agent-evidence) block near
the end of the report.

```text
Review Report
Verdict: APPROVE / COMMENT / REQUEST CHANGES / BLOCKED
Reviewed target:
Critical issues:
Important improvements:
Minor issues:
Docs status:
Tests/checks reviewed or run:
State checkpoint:
Architecture boundary assessment:
Recommended next action:
```

For approved and merged PRs, also include:

```text
Reviewed head SHA:
Merge method:
Merge SHA:
CI run/job or local-check evidence:
Remaining non-blocking caveats:
```

## Stop conditions

Stop and report when:

- target PR or implementation evidence is missing;
- the PR head changed after review;
- required checks/evidence are unavailable and cannot be substituted honestly;
- PR contains forbidden scope drift;
- merge would require ignoring unresolved request-changes evidence;
- Linear cannot be updated when Linear update is part of the workflow.
