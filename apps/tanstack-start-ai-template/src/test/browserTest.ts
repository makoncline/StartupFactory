import { test as base } from 'vitest'
import { worker } from '../mocks/browser'

export const test = base.extend<{ worker: typeof worker }>({
  worker: [
    async ({}, use) => {
      await worker.start({ quiet: true })
      await use(worker)
      worker.resetHandlers()
      worker.stop()
    },
    { auto: true },
  ],
})

export { expect } from 'vitest'
