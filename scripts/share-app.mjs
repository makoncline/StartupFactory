import { execSync } from 'node:child_process'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      continue
    }
    const [key, maybeValue] = token.split('=', 2)
    const hasNext = maybeValue == null && argv[i + 1] && !argv[i + 1].startsWith('--')
    const value = maybeValue ?? (hasNext ? argv[i + 1] : true)
    if (hasNext) {
      i += 1
    }
    args[key.slice(2)] = value
  }
  return args
}

function run(command, options = {}) {
  return execSync(command, {
    stdio: 'inherit',
    ...options,
  })
}

function runQuiet(command, options = {}) {
  return execSync(command, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    ...options,
  }).toString()
}

function fail(message) {
  console.error(`\n[ share ] ${message}`)
  process.exit(1)
}

const args = parseArgs(process.argv.slice(2))
const app = typeof args.app === 'string' ? args.app : null
const port = Number(args.port)

if (!app) {
  fail('Missing --app <name>')
}
if (!Number.isInteger(port) || port <= 0) {
  fail('Missing/invalid --port <number>')
}
if (port < 43000 || port > 43199) {
  fail('Use a high deterministic port in 43000-43199 for shared apps')
}

const hostname = typeof args.hostname === 'string' && args.hostname.length > 0
  ? args.hostname
  : `${app}.makon.dev`

console.log(`[ share ] mapping ${app} -> ${hostname} (localhost:${port})`)
run(`pnpm tunnel:add -- --app ${app} --port ${port} --hostname ${hostname}`)
run('pnpm tunnel:init')

console.log('[ share ] restarting app dev server on requested port')
try {
  runQuiet(`lsof -i :${port} -t | xargs -r kill`)
} catch {
  // ignore
}
run(`nohup pnpm --filter ./apps/${app} exec vite dev --host 0.0.0.0 --port ${port} > /tmp/${app}-dev.log 2>&1 &`)

console.log('[ share ] restarting tunnel process')
try {
  runQuiet('pgrep -fl "cloudflared tunnel --config /Users/makon/dev/StartupFactory/.cloudflare/config.yml run" | awk \'{print $1}\' | xargs -r kill')
} catch {
  // ignore
}
run('nohup pnpm tunnel:run > /tmp/startup-factory-tunnel.log 2>&1 &')

console.log('[ share ] waiting for public URL')
let ok = false
for (let i = 0; i < 25; i += 1) {
  try {
    const code = runQuiet(`curl -s -o /dev/null -w "%{http_code}" --max-time 8 https://${hostname}`).trim()
    if (code === '200') {
      ok = true
      break
    }
  } catch {
    // keep polling
  }
  runQuiet('sleep 0.5')
}

if (!ok) {
  fail(`public URL not healthy yet: https://${hostname} (check /tmp/${app}-dev.log and /tmp/startup-factory-tunnel.log)`)
}

console.log(`\n[ share ] ready: https://${hostname}`)
