import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function parseArgs(argv) {
  const args = { names: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--name' && argv[i + 1]) {
      args.names.push(argv[i + 1])
      i += 1
      continue
    }
    if (token.startsWith('--name=')) {
      args.names.push(token.slice('--name='.length))
      continue
    }
    if (token === '--all') {
      args.all = true
    }
  }
  return args
}

function listApps(appsDir) {
  if (!existsSync(appsDir)) {
    return []
  }
  return readdirSync(appsDir)
    .map((name) => ({
      name,
      fullPath: path.join(appsDir, name),
    }))
    .filter((entry) => statSync(entry.fullPath).isDirectory())
    .map((entry) => entry.name)
}

function checkApp(repoRoot, appName) {
  const appRoot = path.join(repoRoot, 'apps', appName)
  const failures = []

  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'vitest.config.ts',
    'playwright.config.ts',
    'public/mockServiceWorker.js',
    'src/client.tsx',
    'src/routeTree.gen.ts',
    'src/mocks/handlers.ts',
    'src/mocks/server.ts',
    'src/mocks/browser.ts',
    'src/test/setup.node.ts',
    'src/test/setup.browser.ts',
    'src/test/browserTest.ts',
    'src/test/render.tsx',
    'src/routes/todos.tsx',
    'src/routes/api/todos.ts',
    'src/routes/todos.test.tsx',
    'src/routes/todos.browser.test.tsx',
    'e2e/home.visual.spec.ts',
    'e2e/todos.empty.visual.spec.ts',
    'e2e/todos.error.visual.spec.ts',
  ]

  for (const rel of requiredFiles) {
    if (!existsSync(path.join(appRoot, rel))) {
      failures.push(`missing file: ${rel}`)
    }
  }

  const pkgPath = path.join(appRoot, 'package.json')
  if (!existsSync(pkgPath)) {
    failures.push('missing package.json')
  } else {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const scripts = pkg.scripts ?? {}
    const requiredScripts = [
      'dev',
      'typecheck',
      'test',
      'test:watch',
      'test:browser',
      'test:all',
      'test:e2e',
      'test:e2e:ui',
      'test:e2e:update',
      'verify',
    ]
    for (const script of requiredScripts) {
      if (!scripts[script]) {
        failures.push(`missing script: ${script}`)
      }
    }
  }

  const snapshotDirs = [
    'e2e/home.visual.spec.ts-snapshots',
    'e2e/todos.empty.visual.spec.ts-snapshots',
    'e2e/todos.error.visual.spec.ts-snapshots',
  ]

  for (const rel of snapshotDirs) {
    const full = path.join(appRoot, rel)
    if (!existsSync(full)) {
      failures.push(`missing snapshot dir: ${rel}`)
      continue
    }
    const pngCount = readdirSync(full).filter((value) => value.endsWith('.png')).length
    if (pngCount === 0) {
      failures.push(`no png baselines in: ${rel}`)
    }
  }

  return failures
}

const args = parseArgs(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const appNames = args.all
  ? listApps(path.join(repoRoot, 'apps'))
  : args.names

if (appNames.length === 0) {
  console.error('Usage: pnpm check:app -- --name <app-name> | --all')
  process.exit(1)
}

let hasFailures = false

for (const name of appNames) {
  const failures = checkApp(repoRoot, name)
  if (failures.length === 0) {
    console.log(`[ check:app ] PASS ${name}`)
    continue
  }

  hasFailures = true
  console.error(`\n[ check:app ] FAIL ${name}`)
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
}

if (hasFailures) {
  process.exit(1)
}
