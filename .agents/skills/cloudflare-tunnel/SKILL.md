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

For fastest deterministic setup, prefer:

```bash
pnpm share:app -- --app <app-name> --port <port> [--hostname <host>]
```

For brand-new apps, combine with URL-first bootstrap:

```bash
pnpm new:app:live -- --name <app-name> --port <port>
```

Port policy:

- use `43000-43199` for shared local apps
- avoid common ports like `3000/3001`
- one app = one fixed port

## Add a new app mapping

```bash
pnpm tunnel:add -- --app <app-name> --port <port>
pnpm tunnel:init
pnpm tunnel:urls
```

When starting app servers manually, use deterministic Vite exec form:

```bash
pnpm --filter ./apps/<app-name> exec vite dev --host 0.0.0.0 --port <port>
```

Example:

```bash
pnpm tunnel:add -- --app billing-console --port 43101
pnpm tunnel:init
pnpm tunnel:urls
```

## Files involved

- `.cloudflare/apps.json` (committed source of truth)
- `.cloudflare/config.yml` (generated, not committed)
- `scripts/cloudflare-tunnel.mjs` (automation)

## Reliability note for shared tunnel connectors

If more than one connector is attached to the same tunnel, localhost origins
(`127.0.0.1`) can cause intermittent `502` from connectors on other hosts.

Use `originHost` in `.cloudflare/apps.json` (or `--origin-host`) with a LAN IP
reachable by all connector hosts.

## Troubleshooting

- If URL returns intermittent `502/503`, inspect connectors:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem info startup-factory
  ```

  Remove stale connector by ID:

  ```bash
  cloudflared tunnel --origincert .cloudflare/cert.pem cleanup --connector-id <id> startup-factory
  ```
