import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['.makon.dev'],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    ...(process.env.VITEST === 'true'
      ? []
      : [
          tanstackStart({
            srcDirectory: 'src',
            router: {
              routeFileIgnorePattern: '(?:\\.test\\.|\\.spec\\.)',
            },
          }),
        ]),
    viteReact(),
    nitro(),
  ],
})
