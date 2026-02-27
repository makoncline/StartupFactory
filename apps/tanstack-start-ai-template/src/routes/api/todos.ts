import { createFileRoute } from '@tanstack/react-router'

type Todo = { id: string; title: string }

const DEFAULT_TODOS: Todo[] = [
  { id: 't1', title: 'Buy milk' },
  { id: 't2', title: 'Ship template' },
]

export const Route = createFileRoute('/api/todos')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url)
        const scenario = url.searchParams.get('scenario')

        if (scenario === 'error') {
          return new Response('Server error', { status: 500 })
        }

        if (scenario === 'empty') {
          return Response.json({ todos: [] })
        }

        return Response.json({ todos: DEFAULT_TODOS })
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as { title?: string }
        const title = body.title?.trim() ?? ''

        if (!title) {
          return Response.json({ error: 'title required' }, { status: 400 })
        }

        return Response.json({ todo: { id: 't3', title } })
      },
    },
  },
})
