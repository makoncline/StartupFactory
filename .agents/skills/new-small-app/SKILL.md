# Skill: new-small-app

Create and validate a new small app in this monorepo using the canonical
`apps/tanstack-start-ai-template` blueprint.

The template is intentionally minimal/neutral so each new app can define its
own visual personality.

## When to use

Use this whenever the user asks to:

- add a new app under `apps/*`
- spin up an MVP quickly with existing testing standards
- bootstrap an app with MSW + Vitest + Playwright contract already wired

## Commands

From repo root:

```bash
pnpm new:app -- --name <app-name>
pnpm check:app -- --name <app-name>
pnpm turbo run verify --filter=./apps/<app-name>
```

URL-first fast path:

```bash
pnpm new:app:live -- --name <app-name> --port <43xxx>
```

Optional install step during bootstrap:

```bash
pnpm new:app -- --name <app-name> --install
```

## What this skill enforces

- App-local structure and scripts match the template contract.
- Shared MSW pattern exists for Node and browser tests.
- Required tests exist:
  - jsdom integration test
  - browser mode test
  - 3 visual Playwright tests
- Snapshot directories exist with committed PNG baselines.

## Required app name format

- lowercase letters, numbers, and dashes only: `^[a-z0-9-]+$`

Examples:

- `billing-console`
- `support-desk`
- `admin-v2`

## Post-bootstrap workflow

1. Update feature/domain content for the new app.
2. If the app has a landing/marketing surface, apply `.agents/skills/frontend-design/SKILL.md` and establish a unique visual identity (do not leave template styling unchanged).
3. Run:
   - `pnpm --filter ./apps/<app-name> run test`
   - `pnpm --filter ./apps/<app-name> run test:browser`
   - `pnpm --filter ./apps/<app-name> run test:e2e`
4. If UI changed intentionally, run:
   - `pnpm --filter ./apps/<app-name> run test:e2e:update`
5. Final check:
   - `pnpm turbo run verify --filter=./apps/<app-name>`
6. Do not auto-apply TDD/UI-review skills; only use them if user explicitly asks.
