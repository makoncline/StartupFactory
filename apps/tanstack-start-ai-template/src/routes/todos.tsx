import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'

type Todo = { id: string; title: string }
type Scenario = 'happy' | 'empty' | 'error'

function getScenario(value: unknown): Scenario {
  if (value === 'empty' || value === 'error') {
    return value
  }
  return 'happy'
}

export const Route = createFileRoute('/todos')({
  validateSearch: (search: Record<string, unknown>) => ({
    scenario: getScenario(search.scenario),
  }),
  component: TodosPage,
})

function TodosPage() {
  const navigate = useNavigate({ from: '/todos' })
  const { scenario } = Route.useSearch()

  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const loadTodos = useCallback(async (nextScenario: Scenario) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/todos?scenario=${nextScenario}`)
      if (!response.ok) {
        throw new Error('Failed to load todos')
      }
      const data = (await response.json()) as { todos: Todo[] }
      setTodos(data.todos)
    } catch {
      setTodos([])
      setError('Failed to load todos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTodos(scenario)
  }, [loadTodos, scenario])

  async function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) {
      return
    }

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: nextTitle }),
    })

    if (!response.ok) {
      setError('Unable to add todo right now.')
      return
    }

    const data = (await response.json()) as { todo: Todo }
    setTodos((previous) => [...previous, data.todo])
    setTitle('')
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <main className="space-y-6 pb-4">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Todos</h1>
          <p className="text-sm text-slate-700">
            Minimal demo route used for integration and visual tests.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="scenario" className="mb-1 block text-sm font-semibold">
              Scenario
            </label>
            <select
              id="scenario"
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={scenario}
              onChange={(event) => {
                const nextScenario = getScenario(event.currentTarget.value)
                void navigate({ to: '/todos', search: { scenario: nextScenario } })
              }}
            >
              <option value="happy">happy</option>
              <option value="empty">empty</option>
              <option value="error">error</option>
            </select>
          </div>

          <form className="flex items-end gap-2" onSubmit={handleAddTodo}>
            <div className="flex-1">
              <label htmlFor="new-todo" className="mb-1 block text-sm font-semibold">
                New todo
              </label>
              <input
                ref={inputRef}
                id="new-todo"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <button type="submit" className="rounded border border-slate-400 px-4 py-2">
              Add
            </button>
          </form>
        </div>
      </section>

      <section
        aria-label="Todo results"
        className="min-h-[220px] rounded border border-slate-300 p-5"
      >
        {loading ? <p role="status">Loading todos...</p> : null}

        {!loading && error ? (
          <div role="alert" className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        {!loading && !error && todos.length === 0 ? <p>No todos yet.</p> : null}

        {!loading && !error && todos.length > 0 ? (
          <ul aria-label="Todo list" className="m-0 list-disc space-y-2 pl-5 text-sm">
            {todos.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
