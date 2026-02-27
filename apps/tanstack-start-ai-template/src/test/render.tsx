import { render, type RenderOptions } from '@testing-library/react'
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

export function renderRoute(
  initialLocation: string,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
  })

  return {
    router,
    ...render(<RouterProvider router={router} />, options),
  }
}
