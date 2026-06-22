# Project Documentation

This directory contains architecture, roadmap, standards, QA, workflow, and agent operating documentation for Project Prompt Library.

## Start here

1. [`../AGENTS.md`](../AGENTS.md) — repository-level guardrails for Codex and other agents.
2. [`workflows/current-state-ledger.md`](workflows/current-state-ledger.md) — compact current phase, queue, and caveat ledger.
3. [`agents/README.md`](agents/README.md) — role-specific agent operating specs and queue contract.
4. [`architecture/README.md`](architecture/README.md) and [`architecture/project-prompt-library-architecture-plan.md`](architecture/project-prompt-library-architecture-plan.md).
5. [`roadmap/README.md`](roadmap/README.md) and [`roadmap/project-prompt-library-roadmap.md`](roadmap/project-prompt-library-roadmap.md).
6. [`standards/README.md`](standards/README.md) and [`standards/project-prompt-library-codex-agent-standards.md`](standards/project-prompt-library-codex-agent-standards.md).
7. [`qa/test-strategy.md`](qa/test-strategy.md) and [`qa/ci-evidence.md`](qa/ci-evidence.md).

## Agent operating specs

- [`agents/coding-agent.md`](agents/coding-agent.md)
- [`agents/review-agent.md`](agents/review-agent.md)
- [`agents/qa-agent.md`](agents/qa-agent.md)
- [`agents/coordinator-agent.md`](agents/coordinator-agent.md)
- [`agents/dispatcher.md`](agents/dispatcher.md) — proposed dispatcher; not active until explicitly adopted.

These files are workflow contracts. They do not approve product scope or later-slice behavior.

## Workflow setup docs

- [`workflows/dispatcher-and-learning-setup.md`](workflows/dispatcher-and-learning-setup.md) — proposed dispatcher and role-learning setup.
- [`agents/learning-log.md`](agents/learning-log.md) — proposed audit log for proposed/accepted/rejected/deferred/superseded role-learning decisions.

## Slice implementation baselines

- [`slices/slice-1-invocation-walking-skeleton.md`](slices/slice-1-invocation-walking-skeleton.md)

## Authoritative Slice 1 contract docs

- [`invocation-contract.md`](invocation-contract.md)
- [`prompt-schema.md`](prompt-schema.md)

## Current project state

The current phase is tracked in [`workflows/current-state-ledger.md`](workflows/current-state-ledger.md). At the time this index was updated, the repository has completed M2 through Slice 2.7, M3 inspect work through Slice 3.2, and M3 list work through Slice 3.4. No product slice is active; PL-78 / Slice 3.5 inspect/list golden tests and tool reference work is the next product candidate only after explicit queue selection or promotion.

Current source/cache references:

- [`../src/prompt-source/README.md`](../src/prompt-source/README.md)
- [`../src/cache/README.md`](../src/cache/README.md)
- [`source-cache-behavior.md`](source-cache-behavior.md)

Do not treat Slice 3.5 golden/tool-reference coverage, real prompt files, hosted behavior, private suites, auth, or database behavior as implemented unless the current-state ledger and coordinator gate say so.
