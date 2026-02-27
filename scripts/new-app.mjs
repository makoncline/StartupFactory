import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

function parseArgs(argv) {
  const args = { install: false }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--name' && argv[i + 1]) {
      args.name = argv[i + 1]
      i += 1
      continue
    }
    if (token.startsWith('--name=')) {
      args.name = token.slice('--name='.length)
      continue
    }
    if (token === '--install') {
      args.install = true
    }
  }
  return args
}

function fail(message) {
  console.error(`\n[ new:app ] ${message}`)
  process.exit(1)
}

function isValidAppName(value) {
  return /^[a-z0-9-]+$/.test(value)
}

const args = parseArgs(process.argv.slice(2))

if (!args.name) {
  fail('Missing --name. Example: pnpm new:app -- --name billing-console')
}

if (!isValidAppName(args.name)) {
  fail('App name must match ^[a-z0-9-]+$')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourceApp = path.join(repoRoot, 'apps', 'tanstack-start-ai-template')
const targetApp = path.join(repoRoot, 'apps', args.name)

if (!existsSync(sourceApp)) {
  fail('Template app not found at apps/tanstack-start-ai-template')
}

if (existsSync(targetApp)) {
  fail(`Target already exists: apps/${args.name}`)
}

mkdirSync(path.join(repoRoot, 'apps'), { recursive: true })

cpSync(sourceApp, targetApp, {
  recursive: true,
  filter: (source) => {
    const value = source.split(path.sep).join('/')
    const denied = [
      '/node_modules/',
      '/.output/',
      '/.tanstack/',
      '/.turbo/',
      '/playwright-report/',
      '/test-results/',
      '/.vite/',
      '/.nitro/',
    ]
    return !denied.some((marker) => value.includes(marker))
  },
})

const pkgPath = path.join(targetApp, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.name = args.name
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')

const readmePath = path.join(targetApp, 'README.md')
if (existsSync(readmePath)) {
  const next = readFileSync(readmePath, 'utf8').replace(
    /^#\s+tanstack-start-ai-template/m,
    `# ${args.name}`,
  )
  writeFileSync(readmePath, next, 'utf8')
}

console.log(`\n[ new:app ] Created apps/${args.name} from template.`)
console.log('[ new:app ] Next steps:')
console.log(`  1) pnpm --filter ./apps/${args.name} run test`)
console.log(`  2) pnpm --filter ./apps/${args.name} run test:browser`)
console.log(`  3) pnpm --filter ./apps/${args.name} run test:e2e`)
console.log(`  4) pnpm turbo run verify --filter=./apps/${args.name}`)

if (args.install) {
  console.log('\n[ new:app ] Running pnpm install...')
  execSync('pnpm install', { cwd: repoRoot, stdio: 'inherit' })
}
