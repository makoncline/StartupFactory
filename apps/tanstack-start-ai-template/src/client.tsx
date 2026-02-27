import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

const App = <StartClient />

async function main() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ quiet: true })
  }

  hydrateRoot(
    document,
    import.meta.env.DEV ? <StrictMode>{App}</StrictMode> : App,
  )
}

void main()
