# Static Analysis - SonarQube Cloud Advisory Rollout

Status: first-pass advisory setup
Scope: GitHub Actions reporting only; no PR-blocking quality gate yet

## Current Choice

Use SonarQube Cloud for the initial automated static-analysis backstop. The live
GitHub repository `ARudawski/PromptLibrary` is public, so this should fit the
free public-repository path without paid infrastructure.

This rollout is intentionally advisory:

- code smells, security hotspots, duplication, and coverage are reported in
  SonarQube Cloud;
- the GitHub workflow does not run until required secrets and variables exist;
- the advisory job and Sonar scan step use `continue-on-error: true`;
- no quality-gate action or branch-protection requirement is added yet.

## Human Setup Steps

1. Create or sign in to a SonarQube Cloud account.
2. Connect the GitHub organization or user that owns `ARudawski/PromptLibrary`.
3. Import the public `ARudawski/PromptLibrary` repository.
4. Create a SonarQube Cloud project and note its project key and organization key.
5. Create a SonarQube Cloud token with permission to analyze this project.
6. In GitHub repository settings, add these configuration values:

```text
Repository secret: SONAR_TOKEN
Repository variable: SONAR_PROJECT_KEY
Repository variable: SONAR_ORGANIZATION
```

7. Open a PR or push to `main` to trigger `.github/workflows/sonarqube.yml`.
8. Confirm the workflow uploads coverage from `coverage/lcov.info` and the
   project dashboard shows code smells, security hotspots, coverage, and
   duplication.

Do not enable required quality gates, branch protection changes, paid plans,
new hosted infrastructure, or repository secrets beyond `SONAR_TOKEN` without
explicit human approval.

## First-Scan Triage

After the first successful scan, review only important findings:

- security hotspots or vulnerabilities in reachable runtime code;
- high-confidence code smells that affect maintainability of shared modules;
- duplicated production logic in `src/**`;
- coverage blind spots around invocation, inspect/list behavior, prompt
  validation, source/cache behavior, or local prompt loading.

Create Linear remediation tickets only for findings that need follow-up. Prefer
small, routeable tickets:

```text
Title: Coding Agent - Address Sonar finding in <area>
Labels: agent:codex-local
Acceptance: finding linked, root cause understood, minimal fix or documented
defer decision, deterministic checks named.
```

Use Coordinator Agent follow-ups for process or policy changes, such as deciding
when the advisory scan should become a required quality gate.

## Local Commands

Generate the same LCOV file used by SonarQube Cloud:

```bash
npm run test:coverage
```

Default deterministic CI remains unchanged in `.github/workflows/ci.yml`.
