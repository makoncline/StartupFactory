# Agent Operating Guide: StartupFactory Monorepo

This monorepo hosts many small apps optimized for autonomous AI delivery.

## Monorepo Defaults

1. Prefer app-local changes inside `apps/<app-name>` unless shared infra is clearly needed.
2. Run the smallest loop first (`test`), then broaden (`verify`).
3. Keep tests integration-first and low count.
4. Use MSW for HTTP mocking across Node tests, browser-mode tests, and Playwright.
5. Use Playwright screenshots as the visual contract.
6. For every new app request, ship a minimal placeholder page first and get it live on `*.makon.dev` before building the full UI.

## New App Fast Path

Use this sequence for any new app unless the user explicitly asks for a different flow:

1. Scaffold: `pnpm new:app -- --name <app-name>`
2. Install workspace deps immediately: `pnpm install`
3. Replace `/` with a simple placeholder (hello world + app name)
4. Share early: `pnpm share:app -- --app <app-name> --port <43xxx>`
5. Confirm public URL responds before further feature work
6. Then iterate on design/features in small loops

One-command deterministic variant:

- `pnpm new:app:live -- --name <app-name> --port <43xxx>`
- This performs scaffold + install + placeholder + share + health check.

Rationale: users should get a working URL quickly, then see rapid visible progress.

## Frontend Guidance

1. For landing pages or other marketing-style surfaces, use the repo skill at `.agents/skills/frontend-design/SKILL.md` to drive visual direction.
2. Do not default to card-heavy layouts; use cards only when they communicate clearly separated content blocks.
3. New apps should establish their own visual personality (type, palette, composition, and motion) instead of inheriting the template look unchanged.
4. Keep `apps/tanstack-start-ai-template` visually minimal and neutral so new apps start from a blank slate.

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
- `.agents/skills/new-app-delivery-flow/SKILL.md`
  - Use for: deterministic URL-first app delivery (placeholder first, app second).
  - Proven useful in: reducing bootstrap time and ambiguity in new app sessions.
- `.agents/skills/test-driven-development/SKILL.md`
  - Use for: strict TDD loops.
  - Activation: only when the user explicitly asks.
- `.agents/skills/ui-review/SKILL.md`
  - Use for: structured UI review passes.
  - Activation: only when the user explicitly asks.

## Root Commands

- `pnpm verify` runs the full default app verification chain.
- `pnpm test:e2e:update` updates visual baselines intentionally.
- `pnpm share:app -- --app <app-name> --port <port>` performs deterministic local app sharing to `*.makon.dev`.
- `pnpm new:app:live -- --name <app-name> --port <43xxx>` bootstraps and shares a placeholder app URL in one command.
- Use Turbo filters for specific apps:
  - `pnpm turbo run verify --filter=./apps/<app-name>`

## New App Reliability Notes

1. Run `pnpm install` right after `pnpm new:app`; do not assume per-app binaries (for example `tsc`) are immediately available.
2. Before e2e runs, ensure the Playwright dev port is free (default app port `3000` inside app tests).
3. If visual tests are sensitive, keep one stable screenshot assertion and separate behavioral assertions for dynamic UI state.

## Port Allocation

1. For shared local apps/tunnel mappings, do not use common ports like `3000`/`3001`.
2. Use high deterministic app ports in the `43000-43199` range (one app per port).
3. This enables multiple apps running in parallel without collisions.

## Tunnel Reliability

1. For Cloudflare tunnel mappings, keep `.cloudflare/apps.json` as the source of truth.
2. If the tunnel has multiple connectors, do not rely on `127.0.0.1` origins; set `originHost` to a LAN IP reachable by connector hosts.
3. Use `pnpm share:app -- --app <app-name> --port <port>` for deterministic mapping + startup + health check.

## Snapshot Discipline

1. Update snapshots only via `test:e2e:update`.
2. Review image diffs before accepting updates.
3. Keep `*.spec.ts-snapshots/` committed.

## App-Specific Rules

See each app's local `AGENTS.md` for stricter contracts.
