# CI Evidence Convention

Status: active QA/workflow convention  
Last updated: 2026-06-20

This convention keeps local checks, GitHub Actions, and status API evidence distinct in agent reports.

## Evidence levels

Use the strongest available evidence, but name what was actually verified.

```text
Level 1: local deterministic checks in a verified checkout/worktree
Level 2: GitHub Actions run/job evidence for the reviewed PR head
Level 3: GitHub PR merge evidence with recorded reviewed head and merge SHA
Level 4: status API/check API evidence when available
```

GitHub combined-status or check APIs are useful but are not the only acceptable source. If they return no data, agents may rely on recorded GitHub Actions run IDs/job IDs from PR, review, QA, or coordinator reports, but must say that API status evidence was unavailable.

## Coding Agent requirements

Coding Agent reports must record:

- exact local commands run;
- pass/fail/skipped status;
- checkout/worktree or branch used;
- PR URL when created;
- whether GitHub Actions was pending, unavailable, or not checked.

Coding agents do not have to wait for GitHub Actions unless the issue requires it.

## Review Agent requirements

Review reports must record at least one of:

- GitHub Actions run ID;
- GitHub Actions job ID;
- reviewed head SHA with documented passing CI;
- local deterministic checks run by the reviewer;
- explicit reason CI evidence was unavailable.

Do not approve from a claimed PR summary alone.

## QA Agent requirements

QA reports must distinguish:

```text
Local checks:
GitHub Actions evidence:
Status/check API evidence:
Unavailable/skipped evidence:
```

If QA uses local checks, it must verify the checkout/worktree target and state whether it is pinned to the reviewed commit, merge commit, branch, or current main.

## Coordinator requirements

Coordinator reports must name the evidence source used for the gate decision. If a PR exists, the report should include:

- PR number;
- reviewed head SHA;
- merge SHA when merged;
- GitHub Actions run/job ID if known;
- local command set if CI was unavailable;
- explicit caveats.

## Known current caveats

- `test:golden` has real Slice 2.7 source/cache coverage; future exact-payload behavior still needs slice-specific golden coverage where applicable.
- `validate-prompts` is a real local validator but may pass with zero prompt files until real prompt slices add approved prompt definitions.
- npm audit findings are not automatically blockers but must be reported when observed.
