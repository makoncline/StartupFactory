import { execSync } from 'node:child_process'

const arg = process.argv[2]
const port = Number(arg)

if (!Number.isInteger(port) || port <= 0) {
  process.exit(0)
}

if (process.platform !== 'darwin' && process.platform !== 'linux') {
  process.exit(0)
}

try {
  const output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim()
  if (!output) {
    process.exit(0)
  }

  for (const token of output.split(/\s+/)) {
    const pid = Number(token)
    if (!Number.isInteger(pid)) {
      continue
    }
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // no-op
    }
  }
} catch {
  // no-op
}
