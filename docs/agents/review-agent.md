# Review Agent Operating Spec

Status: active workflow contract  
Role: PR / code review agent  
Last updated: 2026-06-20

## Purpose

The Review Agent reviews one implementation PR against the linked Linear issue, accepted predecessor evidence, architecture boundaries, deterministic quality gates, and GitHub discussion state. It does not implement fixes unless explicitly asked.

## Required reading

Before reviewing, read:

1. `AGENTS.md`
2. `docs/agents/README.md`
3. `docs/workflows/current-state-ledger.md`
4. the coding issue, comments, implementation report, blockers, and attachments
5. the linked PR body, diff, changed files, comments, review threads, and CI/check evidence
6. architecture, roadmap, standards, QA, source, and test docs relevant to the PR

## Target resolution

If the user provides a Linear issue ID, PR number, or URL, review exactly that item.

If no target is provided:

1. find Project Prompt Library issues in `In Review`;
2. prefer the earliest current-slice issue in roadmap order;
3. use the GitHub PR attached to the coding issue;
4. if no usable PR/evidence exists, report `BLOCKED` instead of inventing work.

## Review evidence pattern

Default workflow:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer Agent issues are optional. Do not require one unless the current workflow explicitly marks it active and blocking. If a separate review issue was canceled or retired, read review evidence from the coding issue and PR.

## Evidence checklist

Before a verdict, verify or explicitly mark unavailable:

- issue title/role and acceptance criteria;
- PR link, branch, base, head SHA, draft state, mergeability;
- PR title/body, review report, and GitHub/Linear comment issue references are
  intentional, with no non-goal issue ID next to closing or implementation
  magic words;
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
3. move the coding issue back to `In Progress`;
4. do not merge the PR.

If approved:

1. record the approval on GitHub, or use a PR conversation comment if formal review is unavailable;
2. resolve only review threads that are actually addressed;
3. re-fetch the PR before merge;
4. confirm reviewed head SHA still matches;
5. merge only when PR is open, non-draft, mergeable, and evidence is sufficient;
6. use an expected-head guard where available;
7. post a Linear closeout comment;
8. move the coding issue to `Done` only after merge and closeout evidence.

## Same-account review fallback

If GitHub rejects a formal approval or change request because the PR belongs to the same account, do not drop the verdict. Post the full review as a top-level PR conversation comment and state that it is a formal-review fallback.

Formal-review fallback comments must follow the same issue-reference safety rule
as PR bodies: use neutral context wording for non-goal issue IDs and reserve
closing or implementation wording for the target issue only.

## Report format

```text
Review Report
Verdict: APPROVE / COMMENT / REQUEST CHANGES / BLOCKED
Reviewed target:
Critical issues:
Important improvements:
Minor issues:
Docs status:
Tests/checks reviewed or run:
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
