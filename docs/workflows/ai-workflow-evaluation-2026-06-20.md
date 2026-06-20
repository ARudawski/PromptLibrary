# AI Workflow Evaluation Report — Project Prompt Library

Date: 2026-06-20
Repository: `ARudawski/PromptLibrary`
Linear project: `Project Prompt Library`
Evaluator: ChatGPT workflow audit

## Executive summary

The workflow is already beyond a basic AI-assisted development setup. It has a real slice-based operating model, executable Linear agent tickets, GitHub PR traceability, deterministic CI, agent instructions, QA gates, coordinator gates, and clear V1 boundaries.

The system is working surprisingly well for a solo project: coding agents are producing scoped branches and PRs, review comments are catching real issues, QA is producing process feedback, and coordinator gates are making proceed/fix decisions instead of blindly merging agent output.

The main weakness is no longer implementation discipline. The main weakness is source-of-truth drift and automation semantics. Several durable documents and Linear project fields still describe the project as if it is near Slice 0, while the repo and recent PRs are already in M2 / Slice 2.3–2.4 territory. Some review-process rules changed midstream, but those changes are not fully encoded in the operating model and future ticket templates yet.

Practical verdict:

- Workflow maturity: high for a solo/local AI-agent project.
- Current risk: medium, mostly coordination/process risk, not product-code risk.
- Best next move: stabilize the operating docs and queue semantics before adding more autonomous execution.

## Evidence inspected

### GitHub

- `README.md`
- `AGENTS.md`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/roadmap/project-prompt-library-roadmap.md`
- `docs/architecture/project-prompt-library-architecture-plan.md`
- `docs/qa/test-strategy.md`
- recent PR list, especially PR #15: `[ALJ-37] Slice 2.3 runtime prompt cache with TTL`
- latest merge commit evidence for PR #15
- missing `.github/pull_request_template.md`

### Linear

- Project: `Project Prompt Library`
- Linear document: `Workflow Operating Model`
- Statuses and labels
- Milestones M0–M6
- Current and recent issues, especially:
  - ALJ-37 — Slice 2.3 coding agent
  - ALJ-38 — retired/canceled separate code reviewer ticket
  - ALJ-40 — Slice 2.3 coordinator gate
  - ALJ-57 — QA sweep review-state reconciliation
  - ALJ-58 — QA automation workspace alignment
  - ALJ-41 through ALJ-56 — queued M2 follow-on work

## What is working well

### 1. The slice model is doing real work

The project has not collapsed into generic “agent, go build feature” prompting. Linear issues are large prompts, but they are bounded by slice, role, dependencies, scope, non-goals, acceptance criteria, stop conditions, and report format.

That is exactly the right pattern for local Codex automation: Linear is acting as a controlled queue of executable work packets.

### 2. GitHub is becoming the durable project memory

The repo has a strong README, detailed `AGENTS.md`, roadmap, architecture plan, standards, QA docs, and source-level READMEs. The current implementation stage is reflected well in the repository README and agent instructions.

The repo already states that the project has passed Slice 0, Slice 1, Slice 2.1, and Slice 2.2 gates, and is now in Slice 2.3 / runtime cache with TTL. That is good canonical state.

### 3. The PR flow is reviewable

Recent PRs are consistently linked to Linear issues. PR #15 has a useful scope, non-goals, changed files summary, test results, docs updates, known limitations, and QA notes.

The workflow also demonstrated real correction: the first review of PR #15 requested changes on cache fail-closed behavior and TTL timestamping; the coding agent fixed both; the closeout review approved the revised head; then the PR was merged.

That is the workflow actually doing its job, not just generating ceremony.

### 4. The guardrails are unusually strong

`AGENTS.md` is doing important work:

- current phase is explicit;
- approved tools are explicit;
- forbidden V1 features are explicit;
- architecture boundaries are explicit;
- invocation payload hygiene is explicit;
- testing expectations are explicit;
- agent report requirements are explicit.

This is the kind of repo-local instruction file that makes coding agents much less feral.

### 5. QA automation is finding process problems

ALJ-57 and ALJ-58 show that the QA sweep is not only checking product behavior. It is detecting workflow state mismatches and wrong-local-workspace risk. That is valuable because these are exactly the issues that quietly rot an AI-agent workflow.

## Top 5 improvements / fixes / problems to solve

## 1. Update stale Linear project docs and QA docs to current phase

Priority: Critical workflow hygiene

### Problem

The repo README and `AGENTS.md` correctly describe the current phase as Slice 2.3 / M2. But the Linear project description and the `Workflow Operating Model` still describe Slice 0 as the current hard gate. The QA strategy also still presents itself as proof-first bootstrap before Slice 0 implementation.

This creates a source-of-truth split:

- GitHub says the project has passed Slice 0, Slice 1, Slice 2.1, and Slice 2.2, and is now in Slice 2.3.
- Linear project description says the immediate sequence is still Slice 0 proof server → proof evidence → QA audit → only then Slice 1.
- QA strategy still contains old repository/Linear observations such as no Linear issues existing.

### Why it matters

Agents read durable docs. If future automation reads the stale Linear operating model or stale QA strategy, it may make bad gating decisions or over-block work that is already past the premise-validation stage.

This is the highest-leverage fix because it improves every future agent run.

### Recommended fix

Create one small process/docs issue:

```text
[Workflow] Update operating model and QA strategy to current M2 state
```

Scope:

- update Linear project description;
- update Linear `Workflow Operating Model` current-state section;
- update `docs/qa/test-strategy.md` with current phase and revised QA operating model;
- add a short phase ledger to avoid repeating this drift;
- do not rewrite the historical Slice 0 rules; mark them as completed/historical.

Acceptance criteria:

- one canonical current phase is visible in GitHub and Linear;
- historical gates remain documented but no longer appear as immediate next actions;
- QA strategy distinguishes historical proof gate, current M2 source/cache QA, and later M3/M4 gates.

## 2. Make the autonomous queue selection explicit

Priority: High

### Problem

The current Linear statuses are generic: Backlog, Todo, In Progress, In Review, Done, Canceled, Duplicate. The backlog now contains multiple future M2 slice issues, including Slice 2.4 through 2.7. That is fine for planning, but it is not precise enough for an autonomous Codex queue worker unless the automation has a very clear selection rule.

There is currently no dedicated label like `agent:codex-local`, `ready-for-codex-local`, or `auto-executable`.

### Why it matters

If local Codex automation starts pulling tasks, it needs to distinguish:

- known future work;
- next executable issue;
- QA-only issue;
- coordinator report issue;
- issue blocked by predecessor evidence;
- issue that exists but should not run yet.

A clean backlog is not enough once automation starts acting. Automation needs a machine-checkable work contract.

### Recommended fix

Use one of these patterns.

Preferred minimal pattern:

- `Backlog` = known but not executable.
- `Todo` = executable now.
- label `agent:codex-local` = local Codex may pick this.
- label `agent:auto` = recurring automation may pick this without further manual trigger.
- label `gate:manual` = do not auto-execute; human/coordinator gate required.

Then the automation rule becomes:

```text
Pick exactly one issue where:
- project = Project Prompt Library
- state = Todo
- label = agent:codex-local
- not blocked
- title contains the expected role marker
```

Do not let it pick from Backlog.

### Acceptance criteria

- exactly one next coding issue is marked executable at a time;
- QA/coordinator issues are not accidentally executable by coding automation;
- automation never treats all Backlog M2 tickets as ready.

## 3. Codify the new review pattern and remove the obsolete separate-review-ticket assumption

Priority: High

### Problem

The workflow changed during Slice 2.3: the separate Code Reviewer issue ALJ-38 was canceled, and review evidence was recorded directly on the coding issue ALJ-37 and PR #15. ALJ-40 contains a process correction saying not to require a separate Code Reviewer Agent issue for Slice 2.3.

That is probably the better pattern. But it needs to be made durable.

### Why it matters

If future coordinator prompts still expect separate review issues, they may block incorrectly or generate unnecessary work. This already happened once: the system needed a process correction to prevent ALJ-38 from blocking ALJ-40.

### Recommended fix

Update the workflow operating model and future coordinator prompt templates:

- Coding issue owns implementation and review thread.
- PR owns code review evidence.
- QA issue remains separate when the gate matters.
- Coordinator issue synthesizes coding + review + QA evidence.
- Separate Code Reviewer issue is optional, not default.

Recommended default for solo work:

```text
Coding issue -> PR/review on same issue -> QA issue if gate matters -> coordinator gate issue
```

Only create a separate Code Reviewer Agent issue when:

- review is large enough to be its own work item;
- multiple PRs are involved;
- the review itself needs tracking independent of implementation.

### Acceptance criteria

- next generated slice batch does not create obsolete separate reviewer tickets by default;
- coordinator gates no longer expect retired review issues;
- issue templates explain where review evidence must be recorded.

## 4. Add a GitHub PR template and make PR evidence more uniform

Priority: Medium-high

### Problem

The repo has CI and rich PR bodies, but `.github/pull_request_template.md` is missing. Current PR descriptions are good because agents are being prompted well, but the repository itself does not enforce the PR evidence format.

### Why it matters

Prompt quality can drift. A PR template gives every coding agent a visible checklist at the GitHub boundary, independent of the Linear issue prompt.

This is especially useful once automation creates PRs without you manually shaping each one.

### Recommended fix

Add `.github/pull_request_template.md` with fields:

```markdown
## Linked Linear issue

## Linked spec / roadmap slice

## Scope

## Non-goals preserved

## Changed files

## Tests/checks run

## Docs updated

## Architecture boundaries

## Known limitations

## QA / coordinator gate needed before Done

## AI-generated?
```

### Acceptance criteria

- every new PR carries the same evidence shape;
- coordinator gate can read PR body without reconstructing evidence from scattered comments;
- docs/test/QA fields are always visible.

## 5. Make CI/check evidence easier for agents to verify

Priority: Medium

### Problem

The GitHub workflow exists and is strong: Node 22, `npm ci`, typecheck, lint, format check, test, and validate-prompts. However, the evaluation path saw no combined statuses for the latest merge commit even though the review evidence recorded successful GitHub Actions run IDs.

This may simply be an API/check-runs vs statuses visibility issue. Still, the workflow currently relies heavily on reports/comments to locate CI evidence.

### Why it matters

Coordinator agents and QA agents should not have to infer whether CI passed from prose if a machine-readable check result exists somewhere. This becomes more important with recurring automations.

### Recommended fix

Do not overbuild. Add a small CI evidence convention:

- PR body includes GitHub Actions run URL or run ID after checks pass.
- Coordinator gate explicitly records the reviewed run ID/job ID.
- If branch protection is later enabled, require the deterministic quality gate before merge.
- Keep local npm gates in the agent report; keep GitHub Actions as external confirmation.

Optional later improvement:

- add a tiny `docs/qa/ci-evidence.md` convention explaining how agents should find/report CI runs.

### Acceptance criteria

- every coordinator report can point to one CI run ID or state why no CI evidence was available;
- QA comments do not only say “tests passed” but name the command source: local worktree vs GitHub Actions;
- merge decisions do not depend on ambiguous status API behavior.

## Secondary observations

### Project status should probably be `Started`, not `Planned`

Linear still reports the project status as Planned, while M0 and M1 are 100% and M2 is active. This is harmless, but visually misleading.

Recommended fix: move the project to Started/In Progress if that state exists in your workspace.

### Existing quality placeholders are acceptable, but should stay visible

The workflow correctly records that:

- `test:golden` currently exits 0 with no golden files;
- `validate-prompts` is a Slice 2.6 placeholder;
- npm audit currently reports 1 low and 2 moderate findings.

These are not blockers for Slice 2.3, but they should not vanish into old comments. Carry them into the relevant future issues.

### The QA workspace issue was correctly handled

ALJ-58 identified a real risk: QA automation running against the wrong local workspace. It was resolved by identifying the canonical clone path and using issue-specific worktrees. Keep this as a permanent QA rule.

Recommended durable rule:

```text
All local QA/runtime checks must run from the canonical GitHub clone or a pinned issue-specific worktree derived from it.
```

## Recommended immediate action list

1. Create/execute one docs/process issue to update stale current-state docs in Linear and GitHub.
2. Add queue-selection labels for local Codex automation and mark only the next executable issue as `Todo` + `agent:codex-local`.
3. Update coordinator/code-agent ticket templates to use the new review evidence pattern: review on coding issue + PR, not mandatory separate reviewer issue.
4. Add `.github/pull_request_template.md`.
5. Add a short CI evidence convention and include run ID/link in coordinator reports.

## Bottom-line evaluation

This workflow is already good enough to run autonomous local Codex implementation loops for a solo local project. The bottleneck is no longer “can agents produce useful code?” They clearly can.

The next bottleneck is whether the workflow state stays legible as automation accelerates.

The best improvement is not another agent. It is making the current-state ledger, queue-selection rule, review pattern, and PR evidence format boringly explicit.

Boringly explicit is what lets the raccoons keep coding without stealing the steering wheel.
