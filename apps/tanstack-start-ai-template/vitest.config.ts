import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import tsConfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    react(),
  ],
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.node.ts'],
          include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
          exclude: [
            'e2e/**',
            'src/**/*.browser.test.{ts,tsx}',
            'src/**/*.browser.spec.{ts,tsx}',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./src/test/setup.browser.ts'],
          include: ['src/**/*.browser.test.{ts,tsx}', 'src/**/*.browser.spec.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
    ],
  },
})
