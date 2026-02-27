# Agent Operating Guide: tanstack-start-ai-template

This repo is optimized for AI-driven development via tight verification loops:
- Vitest integration tests (jsdom) + MSW (Node)
- Vitest Browser Mode (Chromium) + MSW (Service Worker via fixture)
- Playwright (Chromium-only by default) visual regression via toHaveScreenshot()

## Non-negotiable rules
1) Keep test count small (target: 5 total). Prefer integration. Avoid micro-unit tests.
2) Do NOT test TypeScript guarantees (types, trivial “renders”, prop existence, etc).
3) Do NOT assert network requests directly (e.g., “fetch called”). Assert UI/state outcomes.
4) MSW is the default for HTTP mocking:
   - Node tests: msw/node setupServer in src/test/setup.node.ts
   - Browser tests: msw/browser setupWorker via src/test/browserTest.ts fixture
5) Playwright screenshots are the visual contract.
   - Always use expect(...).toHaveScreenshot(...)
   - Baselines live in *.spec.ts-snapshots/ and MUST be committed.
   - Only update baselines intentionally via: npm run test:e2e:update

## Commands
- Dev:                 npm run dev
- Typecheck:           npm run typecheck
- Fast tests:          npm test
- Real browser test:   npm run test:browser
- E2E + visuals:       npm run test:e2e
- Update snapshots:    npm run test:e2e:update
- Definition of done:  npm run verify

## Snapshot update discipline
- If UI changes are intentional:
  1) Run: npm run test:e2e:update
  2) Review the updated images in git diff
  3) Commit snapshots with a message that explains why the UI changed

## Commit cadence (required)
Commit after each major step:
- scaffold
- add deps + configs
- add MSW infra
- add todos feature
- add tests + baselines
- add CI + docs
