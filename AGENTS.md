# Agent Operating Guide: StartupFactory Monorepo

This monorepo hosts many small apps optimized for autonomous AI delivery.

## Monorepo Defaults

1. Prefer app-local changes inside `apps/<app-name>` unless shared infra is clearly needed.
2. Run the smallest loop first (`test`), then broaden (`verify`).
3. Keep tests integration-first and low count.
4. Use MSW for HTTP mocking across Node tests, browser-mode tests, and Playwright.
5. Use Playwright screenshots as the visual contract.

## Frontend Guidance

1. For landing pages or other marketing-style surfaces, use the repo skill at `.agents/skills/frontend-design/SKILL.md` to drive visual direction.
2. Do not default to card-heavy layouts; use cards only when they communicate clearly separated content blocks.

## Knowledge Capture and Skills

1. If something takes non-trivial time to figure out, capture the durable lesson in an `AGENTS.md` file (root for cross-app guidance, app-local for app-specific guidance).
2. If the lesson is repeatable as a workflow, create or update a skill under `.agents/skills/<skill-name>/SKILL.md`.
3. Every repo skill should be documented in this file with:
   - skill path,
   - when to use it,
   - where it has already proven useful.
4. Keep guidance concise and actionable; remove stale rules when they no longer help.

## Skill Registry

- `.agents/skills/frontend-design/SKILL.md`
  - Use for: landing pages and marketing-style UI surfaces.
  - Proven useful in: `apps/tanstack-start-ai-template` redesign of `/` and `/todos` to establish a stronger visual direction.
- `.agents/skills/cloudflare-tunnel/SKILL.md`
  - Use for: exposing local apps to `*.makon.dev` via the shared `startup-factory` Cloudflare Tunnel.
  - Proven useful in: `apps/tanstack-start-ai-template` mapping to `https://tanstack-start-ai-template.makon.dev` with connector cleanup workflow for stable access.

## Root Commands

- `pnpm verify` runs the full default app verification chain.
- `pnpm test:e2e:update` updates visual baselines intentionally.
- Use Turbo filters for specific apps:
  - `pnpm turbo run verify --filter=./apps/<app-name>`

## Snapshot Discipline

1. Update snapshots only via `test:e2e:update`.
2. Review image diffs before accepting updates.
3. Keep `*.spec.ts-snapshots/` committed.

## App-Specific Rules

See each app's local `AGENTS.md` for stricter contracts.
