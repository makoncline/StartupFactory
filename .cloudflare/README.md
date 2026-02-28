# Cloudflare Tunnel Setup

This directory stores repo-local tunnel mappings for exposing local apps to
`*.makon.dev`.

- `apps.json` is committed and defines app -> hostname -> local port mappings.
- `originHost` in `apps.json` defines the host used in tunnel ingress services.
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

Fast deterministic share (recommended):

```bash
pnpm share:app -- --app billing-console --port 43101
```

This performs mapping, managed-config sync, app server start, tunnel restart,
and URL health checks.

Use high, uncommon ports in `43000-43199` so multiple apps can run at once.

For shared tunnels with multiple connectors, set `originHost` to a LAN IP
(for example `192.168.0.70`) instead of `127.0.0.1` so requests can resolve
from any connector host.

## Troubleshooting

- If public URL intermittently returns `502/503`, check active connectors:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem info startup-factory
  ```

  If you see stale connectors, clean one by ID:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem cleanup --connector-id <connector-id> startup-factory
  ```
