import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
;(globalThis as any).__START_TEST_ENV__ = true

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
