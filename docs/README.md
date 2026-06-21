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
- [`agents/learning-log.md`](agents/learning-log.md) — proposed audit log for accepted/rejected/deferred role-learning decisions.

## Slice implementation baselines

- [`slices/slice-1-invocation-walking-skeleton.md`](slices/slice-1-invocation-walking-skeleton.md)

## Authoritative Slice 1 contract docs

- [`invocation-contract.md`](invocation-contract.md)
- [`prompt-schema.md`](prompt-schema.md)

## Current project state

The current phase is tracked in [`workflows/current-state-ledger.md`](workflows/current-state-ledger.md). At the time this index was updated, the repository has passed Slice 0, Slice 1, Slice 2.1, Slice 2.2, and Slice 2.3 gates, and is completing Slice 2.4 QA/coordinator workflow.

Current source/cache references:

- [`../src/prompt-source/README.md`](../src/prompt-source/README.md)
- [`../src/cache/README.md`](../src/cache/README.md)

Do not treat partial-valid/cold-failure cache policy, inspect/list, real prompt, or hosted behavior as implemented unless the current-state ledger and coordinator gate say so.
