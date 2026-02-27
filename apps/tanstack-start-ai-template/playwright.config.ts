import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const USE_BRANDED_CHROME = process.env.PW_CHROME_CHANNEL === 'chrome'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    ...devices['Desktop Chrome'],
    channel: USE_BRANDED_CHROME ? 'chrome' : undefined,
  },
  expect: {
    toHaveScreenshot: {
      stylePath: path.join(__dirname, 'e2e', 'screenshot.css'),
      animations: 'disabled',
      maxDiffPixels: 100,
    },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITEST: 'false',
      VITE_MSW: 'true',
    },
  },
})
