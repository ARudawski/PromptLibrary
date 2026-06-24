# Project Documentation

This directory contains architecture, roadmap, standards, QA, workflow, and agent operating documentation for Project Prompt Library.

## Start here

1. [`../AGENTS.md`](../AGENTS.md) — repository-level guardrails for Codex and other agents.
2. [`workflows/current-state-ledger.md`](workflows/current-state-ledger.md) — compact current phase, queue, and caveat ledger.
3. [`agents/README.md`](agents/README.md) — role-specific agent operating specs and queue contract.
4. [`architecture/README.md`](architecture/README.md) and [`architecture/project-prompt-library-architecture-plan.md`](architecture/project-prompt-library-architecture-plan.md).
5. [`roadmap/README.md`](roadmap/README.md), [`roadmap/project-prompt-library-roadmap.md`](roadmap/project-prompt-library-roadmap.md), [`roadmap/project-prompt-library-m4-plan.md`](roadmap/project-prompt-library-m4-plan.md), and [`roadmap/project-prompt-library-m5-plan.md`](roadmap/project-prompt-library-m5-plan.md).
6. [`standards/README.md`](standards/README.md) and [`standards/project-prompt-library-codex-agent-standards.md`](standards/project-prompt-library-codex-agent-standards.md).
7. [`qa/test-strategy.md`](qa/test-strategy.md) and [`qa/ci-evidence.md`](qa/ci-evidence.md).

## Agent operating specs

- [`agents/coding-agent.md`](agents/coding-agent.md)
- [`agents/review-agent.md`](agents/review-agent.md)
- [`agents/qa-agent.md`](agents/qa-agent.md)
- [`agents/coordinator-agent.md`](agents/coordinator-agent.md)
- [`agents/ai-automation-expert.md`](agents/ai-automation-expert.md) - manual-only automation safety audit role.
- [`agents/dispatcher.md`](agents/dispatcher.md) — proposed dispatcher; not active until explicitly adopted.

These files are workflow contracts. They do not approve product scope or later-slice behavior.

## Workflow setup docs

- [`workflows/ai-automation-development-process-presentation.md`](workflows/ai-automation-development-process-presentation.md) - human-facing presentation of the AI-assisted development process.

- [`workflows/dispatcher-and-learning-setup.md`](workflows/dispatcher-and-learning-setup.md) — proposed dispatcher and role-learning setup.
- [`agents/learning-log.md`](agents/learning-log.md) — proposed audit log for proposed/accepted/rejected/deferred/superseded role-learning decisions.

## Slice implementation baselines

- [`slices/slice-1-invocation-walking-skeleton.md`](slices/slice-1-invocation-walking-skeleton.md)

## Authoritative Slice 1 contract docs

- [`invocation-contract.md`](invocation-contract.md)
- [`prompt-schema.md`](prompt-schema.md)

## Read-only API reference

- [`tool-reference.md`](tool-reference.md)
- [`chatgpt-app-schema.md`](chatgpt-app-schema.md)

## M4 local MVP planning

- [`roadmap/project-prompt-library-m4-plan.md`](roadmap/project-prompt-library-m4-plan.md)

## M5 personal-use trial

- [`roadmap/project-prompt-library-m5-plan.md`](roadmap/project-prompt-library-m5-plan.md)
- [`trials/m5-personal-use-trial-protocol.md`](trials/m5-personal-use-trial-protocol.md)
- [`trials/m5-personal-use-trial-log.md`](trials/m5-personal-use-trial-log.md)

## Current project state

The current phase is tracked in [`workflows/current-state-ledger.md`](workflows/current-state-ledger.md). At the time this index was updated, Slice 5.1 protocol/log work is complete through PL-121 / PR #67, M5.QA.1 protocol review passed through PL-122, and the next allowed product action is PL-123 / Slice 5.2 personal-use trial execution and evidence recording only after the PL-130 State Checkpoint is durable.

Current source/cache references:

- [`../src/prompt-source/README.md`](../src/prompt-source/README.md)
- [`../src/cache/README.md`](../src/cache/README.md)
- [`source-cache-behavior.md`](source-cache-behavior.md)

Do not treat M5.3/M5.4/M5.5/M5.QA/M5.Gate work, hosted behavior, private suites, auth, database behavior, additional real prompt files beyond the approved three-prompt M4 MVP set, or broader runtime behavior as implemented unless the current-state ledger and coordinator gate say so. PL-123 / M5.2 is trial evidence only; it does not authorize prompt, alias, runtime, hosting, or hardening changes.
