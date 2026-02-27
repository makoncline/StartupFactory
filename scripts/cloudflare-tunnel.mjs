import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const cloudflareDir = path.join(repoRoot, '.cloudflare')
const manifestPath = path.join(cloudflareDir, 'apps.json')
const configPath = path.join(cloudflareDir, 'config.yml')
const defaultOriginCertPath = path.join(cloudflareDir, 'cert.pem')

const defaultManifest = {
  zone: 'makon.dev',
  tunnelName: 'startup-factory',
  originCertPath: '.cloudflare/cert.pem',
  apps: [
    {
      name: 'tanstack-start-ai-template',
      hostname: 'tanstack-start-ai-template.makon.dev',
      port: 3000,
    },
  ],
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }

    const [key, maybeValue] = token.split('=', 2)
    const next = maybeValue ?? argv[i + 1]
    const consumesNext = maybeValue == null && argv[i + 1] && !argv[i + 1].startsWith('--')
    const value = next ?? true

    if (consumesNext) {
      i += 1
    }

    args[key.slice(2)] = value
  }
  return args
}

function fail(message) {
  console.error(`\n[ tunnel ] ${message}`)
  process.exit(1)
}

function ensureDir() {
  mkdirSync(cloudflareDir, { recursive: true })
}

function ensureCloudflaredInstalled() {
  try {
    execFileSync('cloudflared', ['--version'], { stdio: 'ignore' })
  } catch {
    fail('cloudflared is not installed. Install it first: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/')
  }
}

function resolveOriginCertPath(manifest, args) {
  const fromArgs = typeof args.origincert === 'string' && args.origincert.length > 0
    ? args.origincert
    : null
  const fromManifest = typeof manifest.originCertPath === 'string' && manifest.originCertPath.length > 0
    ? manifest.originCertPath
    : null
  const chosen = fromArgs ?? fromManifest ?? defaultOriginCertPath
  return path.isAbsolute(chosen) ? chosen : path.join(repoRoot, chosen)
}

function tunnelArgs(originCertPath, commandArgs) {
  return ['tunnel', '--origincert', originCertPath, ...commandArgs]
}

function loadManifest() {
  ensureDir()
  if (!existsSync(manifestPath)) {
    saveManifest(defaultManifest)
    return structuredClone(defaultManifest)
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  validateManifest(manifest)
  return manifest
}

function saveManifest(manifest) {
  ensureDir()
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    fail('Invalid .cloudflare/apps.json: expected an object')
  }
  if (typeof manifest.zone !== 'string' || manifest.zone.length === 0) {
    fail('Invalid .cloudflare/apps.json: "zone" is required')
  }
  if (typeof manifest.tunnelName !== 'string' || manifest.tunnelName.length === 0) {
    fail('Invalid .cloudflare/apps.json: "tunnelName" is required')
  }
  if (!Array.isArray(manifest.apps) || manifest.apps.length === 0) {
    fail('Invalid .cloudflare/apps.json: "apps" must be a non-empty array')
  }

  if (
    manifest.originCertPath != null &&
    (typeof manifest.originCertPath !== 'string' || manifest.originCertPath.length === 0)
  ) {
    fail('Invalid .cloudflare/apps.json: "originCertPath" must be a non-empty string when provided')
  }

  const seenNames = new Set()
  const seenHosts = new Set()
  for (const app of manifest.apps) {
    if (!app || typeof app !== 'object') {
      fail('Invalid app entry in .cloudflare/apps.json')
    }
    if (typeof app.name !== 'string' || app.name.length === 0) {
      fail('Each app entry needs a non-empty "name"')
    }
    if (seenNames.has(app.name)) {
      fail(`Duplicate app name in manifest: ${app.name}`)
    }
    seenNames.add(app.name)

    if (typeof app.hostname !== 'string' || app.hostname.length === 0) {
      fail(`App ${app.name} needs a non-empty "hostname"`)
    }
    if (seenHosts.has(app.hostname)) {
      fail(`Duplicate hostname in manifest: ${app.hostname}`)
    }
    seenHosts.add(app.hostname)

    if (!app.hostname.endsWith(`.${manifest.zone}`)) {
      fail(`App ${app.name} hostname must end with .${manifest.zone}`)
    }

    if (!Number.isInteger(app.port) || app.port <= 0) {
      fail(`App ${app.name} needs a valid numeric "port"`)
    }
  }
}

function listTunnels(originCertPath) {
  const output = execFileSync('cloudflared', tunnelArgs(originCertPath, ['list', '--output', 'json']), {
    encoding: 'utf8',
  })
  return JSON.parse(output)
}

function ensureTunnel(tunnelName, originCertPath) {
  const existing = listTunnels(originCertPath).find((item) => item.name === tunnelName)
  if (existing) {
    return existing.id
  }

  if (!existsSync(originCertPath)) {
    fail(
      `No Cloudflare cert found at ${originCertPath}. Run: cloudflared tunnel --origincert ${originCertPath} login`,
    )
  }

  console.log(`[ tunnel ] Creating tunnel ${tunnelName}...`)
  execFileSync('cloudflared', tunnelArgs(originCertPath, ['create', tunnelName]), { stdio: 'inherit' })

  const created = listTunnels(originCertPath).find((item) => item.name === tunnelName)
  if (!created) {
    fail(`Tunnel ${tunnelName} was not found after creation`)
  }
  return created.id
}

function credentialsPathForTunnel(tunnelId) {
  return path.join(os.homedir(), '.cloudflared', `${tunnelId}.json`)
}

function ensureCredentialsFile(tunnelId, originCertPath) {
  const credentialsPath = credentialsPathForTunnel(tunnelId)
  if (existsSync(credentialsPath)) {
    return credentialsPath
  }

  console.log(`[ tunnel ] Generating credentials file for tunnel ${tunnelId}...`)
  try {
    execFileSync(
      'cloudflared',
      tunnelArgs(originCertPath, ['token', '--cred-file', credentialsPath, tunnelId]),
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (error) {
    const message = `${error.stdout ?? ''}${error.stderr ?? ''}`
    fail(`Failed to generate credentials file for tunnel ${tunnelId}:\n${message}`)
  }

  if (!existsSync(credentialsPath)) {
    fail(`Tunnel credentials file not found after generation: ${credentialsPath}`)
  }

  return credentialsPath
}

function writeConfig(manifest, tunnelId, originCertPath) {
  const credentialsPath = ensureCredentialsFile(tunnelId, originCertPath)

  const lines = [
    `tunnel: ${tunnelId}`,
    `credentials-file: ${credentialsPath}`,
    '',
    'ingress:',
  ]

  for (const app of manifest.apps) {
    lines.push(`  - hostname: ${app.hostname}`)
    lines.push(`    service: http://127.0.0.1:${app.port}`)
  }
  lines.push('  - service: http_status:404')

  writeFileSync(configPath, `${lines.join('\n')}\n`, 'utf8')
}

function extractTunnelIdFromMessage(message) {
  const match = message.match(/tunnelID=([0-9a-f-]+)/i)
  return match?.[1] ?? null
}

function ensureDnsRoute(tunnelRef, hostname, originCertPath, expectedTunnelId) {
  try {
    const output = execFileSync('cloudflared', tunnelArgs(originCertPath, ['route', 'dns', tunnelRef, hostname]), {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const text = output.trim()
    if (text) {
      console.log(text)
    }

    const observedId = extractTunnelIdFromMessage(text)
    if (expectedTunnelId && observedId && observedId !== expectedTunnelId) {
      fail(
        [
          `DNS route for ${hostname} points to a different tunnel.`,
          `Expected tunnel ID: ${expectedTunnelId}`,
          `Observed tunnel ID: ${observedId}`,
          'If this is stale, remove/update DNS route in Cloudflare Zero Trust and rerun tunnel:init.',
        ].join('\n'),
      )
    }
  } catch (error) {
    const message = `${error.stdout ?? ''}${error.stderr ?? ''}`
    const normalized = message.toLowerCase()
    if (normalized.includes('already exists') || normalized.includes('already points to') || normalized.includes('same tunnel')) {
      console.log(`[ tunnel ] DNS already routed: ${hostname}`)
      return
    }
    fail(`Failed DNS routing for ${hostname}:\n${message}`)
  }
}

function commandInit(args) {
  ensureCloudflaredInstalled()
  const manifest = loadManifest()
  const originCertPath = resolveOriginCertPath(manifest, args)

  if (!existsSync(originCertPath)) {
    fail(
      `No origin cert found at ${originCertPath}. Run: pnpm tunnel:login`,
    )
  }

  if (typeof args.zone === 'string' && args.zone.length > 0) {
    manifest.zone = args.zone
    manifest.apps = manifest.apps.map((app) => {
      const hostPrefix = app.hostname.split('.')[0]
      return {
        ...app,
        hostname: `${hostPrefix}.${manifest.zone}`,
      }
    })
  }

  if (typeof args.tunnel === 'string' && args.tunnel.length > 0) {
    manifest.tunnelName = args.tunnel
  }

  validateManifest(manifest)
  saveManifest(manifest)

  const tunnelId = ensureTunnel(manifest.tunnelName, originCertPath)
  writeConfig(manifest, tunnelId, originCertPath)

  console.log(`[ tunnel ] Routing DNS for ${manifest.apps.length} app(s)...`)
  for (const app of manifest.apps) {
    ensureDnsRoute(tunnelId, app.hostname, originCertPath, tunnelId)
  }

  console.log('\n[ tunnel ] Setup complete')
  console.log(`  config: ${path.relative(repoRoot, configPath)}`)
  console.log(`  tunnel: ${manifest.tunnelName} (${tunnelId})`)
  console.log('\n[ tunnel ] Next steps:')
  console.log('  1) Start local app dev server(s)')
  console.log('  2) Run: pnpm tunnel:run')
  console.log('  3) Run: pnpm tunnel:urls')
}

function commandAdd(args) {
  ensureCloudflaredInstalled()
  const appName = typeof args.app === 'string' ? args.app : typeof args.name === 'string' ? args.name : null
  const port = Number(args.port)

  if (!appName) {
    fail('Missing app name. Use: --app <name>')
  }
  if (!Number.isInteger(port) || port <= 0) {
    fail('Missing or invalid --port <number>')
  }

  const manifest = loadManifest()
  const originCertPath = resolveOriginCertPath(manifest, args)

  if (!existsSync(originCertPath)) {
    fail(
      `No origin cert found at ${originCertPath}. Run: pnpm tunnel:login`,
    )
  }
  if (typeof args.zone === 'string' && args.zone.length > 0) {
    manifest.zone = args.zone
  }
  if (typeof args.tunnel === 'string' && args.tunnel.length > 0) {
    manifest.tunnelName = args.tunnel
  }

  const hostname = typeof args.hostname === 'string' && args.hostname.length > 0
    ? args.hostname
    : `${appName}.${manifest.zone}`

  const existingIndex = manifest.apps.findIndex((entry) => entry.name === appName)
  const nextEntry = { name: appName, hostname, port }

  if (existingIndex >= 0) {
    manifest.apps[existingIndex] = nextEntry
  } else {
    manifest.apps.push(nextEntry)
  }

  validateManifest(manifest)
  saveManifest(manifest)

  const tunnel = listTunnels(originCertPath).find((item) => item.name === manifest.tunnelName)
  if (!tunnel) {
    console.log(`[ tunnel ] Saved mapping for ${appName}. Run pnpm tunnel:init to create/configure tunnel.`)
    return
  }

  writeConfig(manifest, tunnel.id, originCertPath)
  ensureDnsRoute(tunnel.id, hostname, originCertPath, tunnel.id)
  console.log(`[ tunnel ] Added mapping ${appName} -> https://${hostname} (localhost:${port})`)
}

function commandLogin(args) {
  ensureCloudflaredInstalled()
  const manifest = loadManifest()
  const originCertPath = resolveOriginCertPath(manifest, args)
  const defaultCertPath = path.join(os.homedir(), '.cloudflared', 'cert.pem')

  ensureDir()
  if (existsSync(originCertPath)) {
    fail(
      `Origin cert already exists at ${originCertPath}. Move/delete it first if you need to re-login for a different zone/account.`,
    )
  }

  execFileSync('cloudflared', ['tunnel', 'login'], { stdio: 'inherit' })

  if (!existsSync(defaultCertPath)) {
    fail(`Expected login output at ${defaultCertPath}, but file was not found`)
  }

  if (originCertPath !== defaultCertPath) {
    copyFileSync(defaultCertPath, originCertPath)
    console.log(`[ tunnel ] Copied login cert/token to ${originCertPath}`)
  }
}

function commandRun() {
  ensureCloudflaredInstalled()
  if (!existsSync(configPath)) {
    fail(`Missing ${path.relative(repoRoot, configPath)}. Run: pnpm tunnel:init`)
  }

  execFileSync('cloudflared', ['tunnel', '--config', configPath, 'run'], {
    stdio: 'inherit',
  })
}

function commandUrls() {
  const manifest = loadManifest()
  console.log(`[ tunnel ] Zone: ${manifest.zone}`)
  console.log(`[ tunnel ] Tunnel: ${manifest.tunnelName}`)
  console.log('')
  for (const app of manifest.apps) {
    console.log(`${app.name}`)
    console.log(`  public: https://${app.hostname}`)
    console.log(`  local:  http://127.0.0.1:${app.port}`)
  }
}

function commandHelp() {
  console.log('Usage: node scripts/cloudflare-tunnel.mjs <command> [options]')
  console.log('')
  console.log('Commands:')
  console.log('  init                Create/configure tunnel + DNS routes + config file')
  console.log('  login               Login for this repo and write origin cert to .cloudflare/cert.pem')
  console.log('  add                 Add/update one app mapping')
  console.log('  run                 Run cloudflared using generated config')
  console.log('  urls                Print public/local URLs from manifest')
  console.log('')
  console.log('Options:')
  console.log('  --tunnel <name>     Tunnel name override')
  console.log('  --zone <zone>       DNS zone override')
  console.log('  --app <name>        App name for add')
  console.log('  --port <port>       Local port for add')
  console.log('  --hostname <host>   Public hostname for add')
}

const args = parseArgs(process.argv.slice(2))
const command = args._[0]

switch (command) {
  case 'login':
    commandLogin(args)
    break
  case 'init':
    commandInit(args)
    break
  case 'add':
    commandAdd(args)
    break
  case 'run':
    commandRun()
    break
  case 'urls':
    commandUrls()
    break
  default:
    commandHelp()
    process.exit(command ? 1 : 0)
}
