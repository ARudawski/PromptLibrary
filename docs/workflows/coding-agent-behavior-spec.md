# Coding Agent Behavior Spec

Date: 2026-06-20
Repository: `ARudawski/PromptLibrary`
Linear project: `Project Prompt Library`
Status: operating specification for local Codex/Coding Agent runs

## Purpose

This document captures the expected behavior of the Coding Agent loop used for Project Prompt Library. It is meant to make the behavior reproducible by a future Codex thread, recurring automation, or human operator.

This is a workflow specification, not a product architecture change. It does not approve new product scope, new ChatGPT-facing tools, new runtime behavior, or later-slice work.

## Authority

The Coding Agent follows this source-of-truth order:

1. explicit current user instruction;
2. approved architecture plan and ADRs;
3. approved implementation roadmap;
4. Codex agent standards;
5. QA strategy and QA Coordinator requirements;
6. Linear issue acceptance criteria;
7. GitHub issue or PR description;
8. repository documentation;
9. existing code;
10. existing tests.

If this behavior spec conflicts with a higher-priority source, the higher-priority source wins. The agent must stop and report the conflict instead of silently improvising.

## Required operating context

Before editing, the agent must verify the actual repository and branch.

Canonical GitHub repository:

```text
ARudawski/PromptLibrary
```

Canonical local checkout family:

```text
C:\Users\Anwender\IdeaProjects\PromptLibrary
```

The user has more than one similarly named local checkout. The agent must not assume the current shell directory is the canonical implementation checkout. If a separate worktree is useful, create a slice-specific worktree from current `origin/main`.

## Trigger types

### Explicit issue trigger

If the user provides a Linear issue ID, execute exactly that issue if it is a Coding Agent issue and is not blocked.

### Next-issue trigger

If the user asks for the next issue or a heartbeat automation fires, find the next unblocked executable Linear issue for the current slice or milestone.

The agent must not start:

- QA Agent issues;
- Human issues;
- Coordinator issues;
- blocked issues;
- later-slice work;
- issues whose title or body does not authorize Coding Agent execution.

If no executable issue exists, stop quietly for heartbeat runs or report that no executable issue was found for direct user runs.

### Docs-only direct trigger

If the user explicitly asks for repository documentation and no Linear issue is provided, treat the request as a bounded docs-only task. Do not write product code. Keep changes limited to Markdown and documentation indexes unless the user explicitly asks otherwise.

## Intake checklist

For every non-trivial issue or docs task, identify:

- issue or task title;
- goal;
- source documents;
- scope;
- non-goals;
- relevant architecture boundaries;
- likely files;
- test expectations;
- documentation expectations;
- acceptance criteria;
- stop conditions.

If required input is missing and assumptions would be risky, stop and ask for clarification.

## Repository inspection checklist

Before editing, inspect:

- current branch and dirty state;
- remote and base branch;
- `README.md`;
- `AGENTS.md`;
- `docs/architecture/README.md`;
- `docs/roadmap/README.md`;
- `docs/standards/README.md`;
- relevant full architecture, roadmap, standards, QA, source, and test docs;
- package manager and scripts;
- relevant source and test modules;
- relevant GitHub PRs or branches;
- relevant Linear comments, predecessor reports, blockers, and attachments.

The agent should produce a brief implementation plan before editing.

## Branch and PR behavior

Use one branch per issue or bounded task.

Branch naming:

```text
codex/<issue-id-or-short-task-name>
```

Before committing, the branch should be based on current `origin/main` or an approved base. If main moves during the run, check whether rebase or merge is needed before pushing.

For completed implementation or docs work, push the branch and open a GitHub PR for review. In this project, completed work should normally open a ready-for-review PR so the review agent can inspect and merge it if appropriate. Use a draft PR only when the implementation is intentionally incomplete or needs early review.

The PR body should include:

- linked Linear issue if one exists;
- slice or task identifier;
- scope;
- non-goals preserved;
- changed files summary;
- tests and checks run;
- documentation updates;
- known limitations;
- QA or review notes.

## Implementation behavior

The agent implements only the approved issue or bounded docs task.

It must not introduce V1 non-goals, including:

- prompt editing;
- draft management in ChatGPT;
- ChatGPT-facing cache refresh or admin/debug tools;
- private prompt suites;
- auth or OAuth;
- database schema;
- semantic routing;
- workflow engine;
- UI widget;
- hosted deployment;
- real prompt files, inspect/list tools, or later-slice features unless explicitly approved.

For product-code slices, preserve the dependency direction:

```text
MCP adapter
  -> application use cases
    -> domain
    -> cache/index
    -> prompt source
    -> parser/validator/projection
```

For docs-only tasks, do not touch product code.

## Testing and checks

Run the checks requested by the issue. When applicable, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run validate-prompts
```

When the repo has more granular checks, also use relevant focused checks such as:

```bash
npm run test:unit
npm run test:contract
npm run test:golden
```

Report checks exactly. Do not claim a command passed if it was not run. Keep existing caveats visible, including placeholder prompt validation or golden scripts with no golden files.

Core tests must remain deterministic and no-network unless an issue explicitly authorizes live smoke or integration checks.

## Linear behavior

For Coding Agent implementation issues:

- move the issue to `In Progress` when work starts;
- post the final Coding Agent report as a Linear comment;
- move completed work to `In Review`, not `Done`;
- do not close Linear issues unless explicitly instructed;
- do not create new Linear issues unless explicitly instructed.

The final Linear report should include:

- scope completed;
- files changed;
- docs changed or docs not needed;
- checks run and results;
- architecture boundaries preserved;
- known issues or blockers;
- recommended next issue or action;
- PR link.

If follow-up work is discovered, report it as a draft recommendation instead of silently expanding the current issue.

## Heartbeat behavior

Recurring heartbeat runs should be conservative.

On heartbeat:

1. Look for the next executable Coding Agent issue only if the heartbeat instructions ask for that.
2. Skip QA, Human, and Coordinator issues.
3. Stop if there is no executable issue.
4. Do not start later-slice work just to stay busy.
5. Use `DONT_NOTIFY` when no user action is needed.
6. Use `NOTIFY` when meaningful work was completed, blocked, or needs user attention.

Heartbeat completion should not mark work `Done`; completed Coding Agent work should still go to `In Review`.

## Stop conditions

Stop and report instead of continuing when:

- required issue context is missing;
- the issue conflicts with architecture, roadmap, or V1 non-goals;
- the task requires QA, Human, or Coordinator authority;
- the repository state contradicts the approved source documents;
- the implementation requires later-slice behavior;
- deterministic tests reveal a real behavior conflict;
- a dependency, package-manager, or lockfile change would be needed without approval;
- only blocked, review, QA, human, or coordinator work remains.

Use explicit conflict reporting instead of hiding the decision in a PR note.

## Reproducible agent prompt

Use this prompt shape for recurring Coding Agent execution:

```text
Use Linear and GitHub for Project Prompt Library.

Find the next unblocked Linear issue in order for the current slice/milestone.
If an issue ID is provided, use that issue instead.
Execute exactly that issue and no later-slice work.

Do not start QA Agent issues.
Do not start Human issues.
Do not start Coordinator issues.
If you do not find any executable issue, stop.

Before acting:
- read the Linear issue body, blockers, linked comments, and predecessor reports;
- read README.md, AGENTS.md, and all repo docs required by the issue;
- inspect the current GitHub repo state;
- verify the canonical repo/worktree and branch.

Rules:
- stay inside the issue scope and non-goals;
- if the issue is design/docs-only, do not write product code;
- if implementation is allowed, keep the change small;
- ensure the branch is not behind main before commit/push;
- commit and push the branch;
- open a ready PR for the review agent when the work is complete;
- treat GitHub documentation as part of the deliverable when the issue mentions docs, contracts, schemas, architecture, or agent handoff;
- do not add GitHub source/cache/real prompts/inspect/list/private/auth/DB unless the issue explicitly allows it;
- stop and report BLOCKED if required inputs are missing or the issue conflicts with architecture/roadmap.

Run the checks requested by the issue, at minimum where applicable:
- npm run typecheck
- npm run lint
- npm run format:check
- npm run test
- npm run validate-prompts

Report back in Linear with:
- scope completed;
- files changed;
- docs changed or docs not needed;
- checks run and results;
- architecture boundaries preserved;
- known issues/blockers;
- recommended next issue/action.

Move completed Coding Agent issues to In Review, not Done.
```

## Expected output

A successful Coding Agent run leaves behind:

- a small scoped diff;
- a pushed `codex/` branch;
- a PR linked to Linear when a Linear issue exists;
- deterministic check evidence;
- updated docs when docs are in scope;
- a Linear report comment for Linear-backed work;
- the Linear issue in `In Review`;
- no hidden product-scope expansion.
