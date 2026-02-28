import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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

function fail(message) {
  console.error(`\n[ new:app:live ] ${message}`)
  process.exit(1)
}

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit' })
}

function isValidAppName(value) {
  return /^[a-z0-9-]+$/.test(value)
}

function findPort(manifest, explicitPort) {
  if (explicitPort != null) {
    const parsed = Number(explicitPort)
    if (!Number.isInteger(parsed) || parsed < 43000 || parsed > 43199) {
      fail('Provided --port must be in 43000-43199')
    }
    return parsed
  }

  const used = new Set((manifest.apps ?? []).map((app) => app.port))
  for (let port = 43000; port <= 43199; port += 1) {
    if (!used.has(port)) {
      return port
    }
  }

  fail('No free ports in 43000-43199. Provide --port explicitly.')
}

const args = parseArgs(process.argv.slice(2))
const appName = typeof args.name === 'string' ? args.name : null

if (!appName) {
  fail('Missing --name <app-name>')
}

if (!isValidAppName(appName)) {
  fail('App name must match ^[a-z0-9-]+$')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const manifestPath = path.join(repoRoot, '.cloudflare', 'apps.json')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const port = findPort(manifest, args.port)
const hostname = typeof args.hostname === 'string' && args.hostname.length > 0
  ? args.hostname
  : `${appName}.makon.dev`

console.log(`[ new:app:live ] creating app ${appName}`)
run(`pnpm new:app -- --name ${appName}`, repoRoot)

console.log('[ new:app:live ] installing workspace deps')
run('pnpm install', repoRoot)

const indexPath = path.join(repoRoot, 'apps', appName, 'src', 'routes', 'index.tsx')
const placeholder = `import { createFileRoute } from '@tanstack/react-router'\n\nexport const Route = createFileRoute('/')({\n  component: Home,\n})\n\nfunction Home() {\n  return (\n    <main className="space-y-2">\n      <h1 className="text-3xl font-semibold">Hello World</h1>\n      <p className="text-slate-700">${appName}</p>\n    </main>\n  )\n}\n`
writeFileSync(indexPath, placeholder, 'utf8')

console.log(`[ new:app:live ] sharing https://${hostname} on port ${port}`)
run(`pnpm share:app -- --app ${appName} --port ${port} --hostname ${hostname}`, repoRoot)

console.log(`\n[ new:app:live ] ready: https://${hostname}`)
