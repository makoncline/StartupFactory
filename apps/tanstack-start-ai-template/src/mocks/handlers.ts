import { http, HttpResponse } from 'msw'

export type Todo = { id: string; title: string }

const HAPPY_TODOS: Todo[] = [
  { id: 't1', title: 'Buy milk' },
  { id: 't2', title: 'Ship template' },
]

export const handlers = [
  http.get('/api/todos', ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario')

    if (scenario === 'empty') {
      return HttpResponse.json({ todos: [] })
    }

    if (scenario === 'error') {
      return new HttpResponse('Server error', { status: 500 })
    }

    return HttpResponse.json({ todos: HAPPY_TODOS })
  }),

  http.post('/api/todos', async ({ request }) => {
    const body = (await request.json()) as { title?: string }
    const title = (body.title ?? '').trim()

    if (!title) {
      return HttpResponse.json({ error: 'title required' }, { status: 400 })
    }

    return HttpResponse.json({ todo: { id: 't3', title } })
  }),
]
