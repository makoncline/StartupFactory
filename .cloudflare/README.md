# Cloudflare Tunnel Setup

This directory stores repo-local tunnel mappings for exposing local apps to
`*.makon.dev`.

- `apps.json` is committed and defines app -> hostname -> local port mappings.
- `config.yml` is generated locally by `pnpm tunnel:init` and should not be committed.

## Workflow

From repo root:

1. `pnpm tunnel:login` and select the `makon.dev` zone/account
2. `pnpm tunnel:init`
3. Start your app locally (for example `pnpm dev:template`)
4. `pnpm tunnel:run`
5. `pnpm tunnel:urls`

If you see `cloudflared service is already installed`, do not run `service install`
again. This repo uses an explicit foreground tunnel process via `pnpm tunnel:run`.

Add another app mapping:

```bash
pnpm tunnel:add -- --app billing-console --port 3001
```

## Troubleshooting

- If public URL intermittently returns `502/503`, check active connectors:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem info startup-factory
  ```

  If you see stale connectors, clean one by ID:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem cleanup --connector-id <connector-id> startup-factory
  ```
