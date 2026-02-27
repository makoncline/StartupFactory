# Napkin

## Corrections

| Date | Source | What Went Wrong | What To Do Instead |
| ---- | ------ | --------------- | ------------------ |
| 2026-02-27 | self | Started planning as if this repo might stay single-app. | Assume monorepo-first when user signals future multi-app scale; design root tooling first. |
| 2026-02-27 | self | Passed nested path as TanStack Start `project-name` (`apps/...`) and CLI rejected it as non URL-friendly. | Use a simple project name and provide nested location via `--target-dir apps/<name>`. |
| 2026-02-27 | self | Kept TanStack Start root route `shellComponent` rendering `<html>` in tests, which caused Vitest Browser Mode hangs/warnings. | Use a plain root `component` layout for app tests to avoid nested document rendering issues. |
| 2026-02-27 | self | Used `__dirname` directly in ESM Playwright config, causing a runtime `ReferenceError`. | Derive `__dirname` using `fileURLToPath(import.meta.url)` + `path.dirname`. |
| 2026-02-27 | self | Removed document shell and scripts from root route while trying to silence test warnings, which broke hydration in browser runs. | Keep `shellComponent` for real app runtime and use a test-only global flag to bypass document wrappers in Vitest. |
| 2026-02-27 | self | Turbo `verify` task depended on `typecheck/test/test:browser/test:e2e` while app `verify` script also ran all of them, causing duplicate parallel e2e and flaky webServer failures. | Make Turbo `verify` run only the app `verify` script (no dependsOn duplication). |
| 2026-02-27 | self | Playwright `reuseExistingServer` + prior test chain produced intermittent `ERR_CONNECTION_REFUSED/ERR_EMPTY_RESPONSE` in `npm run verify`. | Keep Playwright webServer isolated (`reuseExistingServer: false`) and kill port 3000 in pre-`test:e2e` scripts. |
| 2026-02-27 | self | Cloudflare tunnel DNS routing silently targeted the wrong zone/account due existing `cloudflared login` cert scope. | Verify CNAME after route creation and require `cloudflared tunnel login` against the intended zone before `tunnel:init`. |

## User Preferences

- Prioritize AI dev speed and autonomy over broad up-front complexity.
- This repo should evolve into a monorepo with many small apps.
- Use `pnpm` workspaces with Turbo for orchestration.
- For landing pages, explicitly use the `frontend-design` skill.
- Avoid card-heavy layouts; use cards only when they convey truly separate content.
- Promote hard-won lessons into `AGENTS.md`; promote repeatable workflows into repo skills and track their proven use-cases in `AGENTS.md`.
- Capture Cloudflare tunnel setup/cleanup as a repo skill so future app sharing is one-command predictable.

## Patterns That Work

- Keep a strict, deterministic app contract: `typecheck + jsdom integration + browser mode + playwright visual`.
- Use MSW as single mocking source across Node, browser mode, and Playwright.
- Keep Playwright baselines committed and updated only via explicit snapshot update commands.

## Patterns That Don't Work

- Deferring monorepo structure decisions creates rework when adding additional apps.

## Domain Notes

- First app blueprint is `tanstack-start-ai-template` and should be reusable for additional small apps.
