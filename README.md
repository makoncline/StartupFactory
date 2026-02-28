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
- `pnpm new:app:live -- --name <app-name> --port <43xxx>` - scaffold + placeholder + public URL in one command
- `pnpm check:app -- --name <app-name>` - validate app contract compliance
- `pnpm tunnel:login` - login for repo tunnel workflows (writes cert to `.cloudflare/cert.pem`)
- `pnpm tunnel:init` - configure Cloudflare tunnel + DNS routes from `.cloudflare/apps.json`
- `pnpm tunnel:run` - run tunnel process with repo config
- `pnpm tunnel:urls` - print public/local URLs for mapped apps
- `pnpm share:app -- --app <app-name> --port <port> [--hostname <host>]` - one-command map + start + tunnel + health check

For tunnel-sharing ports, use high app ports like `43000-43199` (avoid `3000/3001`) so multiple apps can run in parallel.
If a tunnel has multiple connectors, set `.cloudflare/apps.json` `originHost` to a LAN IP (not `127.0.0.1`) for stable routing.

Recommended app delivery order:

1. Get placeholder URL live first (`new:app:live`)
2. Build real app second
3. Use TDD/UI-review skills only if explicitly requested

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
