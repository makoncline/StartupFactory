# StartupFactory

Monorepo for small AI-built apps with deterministic verification loops.

## Stack

- Workspace: `pnpm` + Turbo
- App framework: TanStack Start
- Testing: Vitest (`jsdom` + Browser Mode), MSW, Playwright visual snapshots

## Apps

- `apps/tanstack-start-ai-template`: canonical template app for future small apps

## Root commands

- `pnpm dev:template` - run the template app in dev mode
- `pnpm verify` - run the full app verification chain
- `pnpm test:e2e:update` - intentionally update visual baselines
- `pnpm new:app -- --name <app-name>` - scaffold a new app from the template
- `pnpm check:app -- --name <app-name>` - validate app contract compliance
- `pnpm tunnel:login` - login for repo tunnel workflows (writes cert to `.cloudflare/cert.pem`)
- `pnpm tunnel:init` - configure Cloudflare tunnel + DNS routes from `.cloudflare/apps.json`
- `pnpm tunnel:run` - run tunnel process with repo config
- `pnpm tunnel:urls` - print public/local URLs for mapped apps

## App verification contract

Each app should expose and pass:

1. `typecheck`
2. `test` (integration-first jsdom)
3. `test:browser` (real browser check)
4. `test:e2e` (Playwright visuals)

Screenshots under `*.spec.ts-snapshots/` are part of source control.

## Repo-local skill

- Skill doc: `.agents/skills/new-small-app/SKILL.md`
- Bootstrap command: `pnpm new:app -- --name billing-console`
- Contract check: `pnpm check:app -- --name billing-console`
