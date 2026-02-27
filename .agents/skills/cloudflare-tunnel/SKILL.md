# Skill: cloudflare-tunnel

Expose local apps in this monorepo on `*.makon.dev` quickly using the shared
`startup-factory` Cloudflare Tunnel.

## When to use

Use this when you need to:

- share a local app build with teammates/devices
- demo a feature from outside your LAN
- map a newly created app to a stable subdomain quickly

## Prerequisites

From repo root:

1. `pnpm tunnel:login` (once per machine/account/zone context)
2. `pnpm tunnel:init`

Then for any session:

3. start local app dev server
4. `pnpm tunnel:run`
5. `pnpm tunnel:urls`

## Add a new app mapping

```bash
pnpm tunnel:add -- --app <app-name> --port <port>
pnpm tunnel:init
pnpm tunnel:urls
```

Example:

```bash
pnpm tunnel:add -- --app billing-console --port 3001
pnpm tunnel:init
pnpm tunnel:urls
```

## Files involved

- `.cloudflare/apps.json` (committed source of truth)
- `.cloudflare/config.yml` (generated, not committed)
- `scripts/cloudflare-tunnel.mjs` (automation)

## Troubleshooting

- If URL returns intermittent `502/503`, inspect connectors:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem info startup-factory
  ```

  Remove stale connector by ID:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem cleanup --connector-id <id> startup-factory
  ```
