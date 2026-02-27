# tanstack-start-ai-template

Template app for autonomous AI delivery loops.

## Commands

- `npm run dev`
- `npm run typecheck`
- `npm run test`
- `npm run test:browser`
- `npm run test:e2e`
- `npm run test:e2e:update`
- `npm run verify`

## What this app demonstrates

- TanStack Start route app with a `/todos` feature
- Start server route at `/api/todos`
- Shared MSW handlers for Node tests and browser tests
- Vitest projects split between `jsdom` and Browser Mode
- Playwright visual contracts with committed baselines

## Snapshot policy

- Baselines live next to specs in `e2e/*.spec.ts-snapshots/`
- Update intentionally only with `npm run test:e2e:update`
