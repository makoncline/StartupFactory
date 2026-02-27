# Final Plan: Monorepo for Fast Autonomous AI App Development

## Mission

Build a `pnpm` + Turbo monorepo that can host many small TanStack Start apps, where each app is optimized for autonomous AI iteration via fast, deterministic verification loops.

Primary outcomes:

1. First app (`tanstack-start-ai-template`) becomes the canonical app blueprint.
2. Every future app can be created quickly with the same quality contract.
3. Agents can run one command to verify correctness and know exactly what failed.

---

## Non-Negotiable Quality Contract (Per App)

These rules carry forward unchanged from the original spec and apply to every app in `apps/*`:

1. Integration-first tests, minimal count (target 4-5 tests total per app).
2. No tests for TypeScript guarantees (typecheck is the gate).
3. No direct request assertions (assert UI behavior/state outcomes).
4. MSW is the default mock layer across:
   - Vitest Node (`setupServer`)
   - Vitest Browser Mode (`setupWorker` via fixture)
   - Playwright (worker started before hydrate)
5. Visual contract uses Playwright `expect(...).toHaveScreenshot()`.
6. Snapshot baselines are committed and updated only intentionally.
7. Commit generated `routeTree.gen.ts` for each app.

---

## Monorepo Architecture

```text
.
├─ .agents/
│  ├─ final-plan.md
│  └─ app-checklist.md                    # generated from this plan later
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ apps/
│  ├─ tanstack-start-ai-template/
│  │  ├─ src/
│  │  ├─ e2e/
│  │  ├─ public/
│  │  ├─ vitest.config.ts
│  │  ├─ playwright.config.ts
│  │  └─ package.json
│  └─ <future-small-apps>/
├─ packages/
│  ├─ testing-config/                     # shared helper utilities + defaults
│  ├─ tsconfig/                           # shared tsconfig base(s)
│  └─ eslint-config/                      # optional in phase 2
├─ AGENTS.md                              # root agent contract
├─ package.json                           # workspace scripts + turbo
├─ pnpm-workspace.yaml
└─ turbo.json
```

Design intent:

- Keep app ownership local (tests/configs live in each app).
- Share only stable infrastructure through `packages/*`.
- Avoid over-abstraction in phase 1; optimize for speed and clarity first.

---

## Tooling Decisions

### Workspace + Orchestration

- Package manager: `pnpm`
- Task orchestration: Turbo
- Strategy: app-local scripts, root orchestrates via Turbo (`turbo run ... --filter ...`)

### Version Discipline

- Keep the pinned testing versions from the original spec for the first app.
- Add root `pnpm.overrides` to prevent drift across future apps.
- Upgrade dependencies in controlled batches, not per-app ad hoc.

### Browser Policy

- Default visual/e2e runtime: Playwright bundled `chromium`.
- Optional branded Chrome via env flag (`PW_CHROME_CHANNEL=chrome`).

---

## Standard Command Surface

### Per App (required scripts)

Each app must expose:

- `dev`
- `typecheck`
- `test`
- `test:watch`
- `test:browser`
- `test:all`
- `test:e2e`
- `test:e2e:ui`
- `test:e2e:update`
- `verify`

### Root (Turbo wrappers)

Root scripts should provide:

- `dev` -> run selected/all app dev servers
- `verify` -> run `typecheck + test + test:browser + test:e2e`
- `test:e2e:update` -> update snapshots for targeted app(s)

Usage pattern:

```bash
pnpm turbo run verify --filter=./apps/tanstack-start-ai-template
pnpm turbo run test:e2e:update --filter=./apps/tanstack-start-ai-template
```

---

## App Blueprint Contract (`apps/tanstack-start-ai-template`)

This first app is the authoritative blueprint for all future small apps.

Must include:

1. TanStack Start scaffold via official CLI.
2. `vite.config.ts` with `process.env.VITEST` gating for `tanstackStart` plugin.
3. `vitest.config.ts` with two projects:
   - `jsdom` project for integration tests
   - `browser` project using `@vitest/browser-playwright` + Chromium
4. `playwright.config.ts` with:
   - fixed viewport
   - `animations: 'disabled'`
   - `stylePath` for deterministic screenshots
   - `webServer` with `VITE_MSW=true`
5. MSW setup with single handler source:
   - `src/mocks/handlers.ts`
   - `src/mocks/server.ts`
   - `src/mocks/browser.ts`
   - `src/test/setup.node.ts`
   - `src/test/setup.browser.ts`
   - `src/test/browserTest.ts`
6. Client hydration guard in `src/client.tsx` that awaits worker start.
7. Demo feature (`/todos` + `/api/todos`) and minimal test suite:
   - 1 jsdom integration test
   - 1 browser mode test
   - 3 Playwright visual tests
8. Committed baselines in `e2e/*.spec.ts-snapshots/`.
9. Committed `src/routeTree.gen.ts`.

---

## CI Strategy (Monorepo)

CI should run from repo root and remain deterministic for agents.

Phase 1 (simple, reliable):

1. `actions/checkout`
2. setup Node LTS
3. setup pnpm
4. `pnpm install --frozen-lockfile`
5. `pnpm exec playwright install --with-deps`
6. `pnpm turbo run verify --filter=./apps/tanstack-start-ai-template`
7. always upload `playwright-report/` artifacts for inspected app(s)

Phase 2 (scale optimization):

- Move to changed-app filtering and/or matrix by app.
- Keep a fallback full-run workflow for nightly confidence.

---

## Agent Operating Model

Root `AGENTS.md` should define monorepo-wide behavior:

1. Prefer app-local changes over cross-cutting refactors unless needed.
2. Always run smallest verification loop first (`test`), then broaden (`verify`).
3. Snapshot updates require explicit intent and explanation.
4. Never bypass MSW conventions.
5. Keep tests few, integration-heavy, and behavior-focused.

Each app may include an app-local `AGENTS.md` for domain rules.

---

## Implementation Phases

## Phase 0 - Workspace bootstrap

Deliverables:

- `pnpm-workspace.yaml`
- root `package.json`
- `turbo.json`
- `apps/`, `packages/`

Checkpoint:

- `pnpm install` succeeds from root.

## Phase 1 - First blueprint app

Deliverables:

- `apps/tanstack-start-ai-template` scaffolded and running
- `routeTree.gen.ts` generated and committed
- pinned testing deps installed

Checkpoint:

- app `npm run dev` works
- route tree exists and is committed

## Phase 2 - Deterministic testing stack

Deliverables:

- Vite/Vitest/Playwright configs wired
- MSW Node + browser setup complete
- client waits for `worker.start()` before hydrate

Checkpoint:

- `test`, `test:browser`, and `test:e2e` commands execute cleanly

## Phase 3 - Demo feature + minimal test suite

Deliverables:

- `/todos` page and `/api/todos` server route
- 2 Vitest tests + 3 visual tests
- baseline screenshots committed

Checkpoint:

- app `verify` passes locally

## Phase 4 - Monorepo CI + agent docs

Deliverables:

- root `AGENTS.md`
- CI workflow with artifact uploads
- optional app checklist in `.agents/app-checklist.md`

Checkpoint:

- CI passes on default branch

---

## New App Bootstrap SOP (for future apps)

When adding `apps/<name>`:

1. Scaffold TanStack Start app in `apps/<name>`.
2. Copy blueprint testing/mocking config from `apps/tanstack-start-ai-template`.
3. Run `msw init` in that app's `public/`.
4. Add one representative feature route and API route.
5. Add minimal 5-test contract (1 jsdom, 1 browser, 3 visual).
6. Generate + commit route tree and screenshot baselines.
7. Verify with Turbo filter for that app.

Target command:

```bash
pnpm turbo run verify --filter=./apps/<name>
```

---

## Definition of Done

This plan is complete when:

1. Monorepo root tooling exists (`pnpm` + Turbo).
2. `apps/tanstack-start-ai-template` fully implements the original spec.
3. Root CI runs verification and publishes Playwright report artifacts.
4. Future app creation follows the same deterministic AI workflow with minimal extra decisions.
