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
      <section className="relative overflow-hidden rounded-[34px] border-2 border-slate-900/20 bg-white/78 p-6 shadow-[0_32px_74px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-[drift_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl animate-[drift_7s_ease-in-out_infinite]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-slate-900/20 bg-slate-950 px-4 py-1 font-['JetBrains_Mono'] text-[0.66rem] font-bold tracking-[0.19em] text-emerald-200 uppercase">
              Demo Route
            </p>
            <h1 className="font-['Bungee'] text-4xl leading-tight text-slate-950 sm:text-5xl">
              Todos
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-700 sm:text-base">
              Flip scenarios to pressure-test loading, empty, and failure states
              while preserving a stable visual testing contract.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-slate-900/15 bg-white/80 p-4 shadow-[0_16px_24px_rgba(15,23,42,0.12)]">
            <div className="mb-4">
              <label htmlFor="scenario" className="mb-2 block font-['JetBrains_Mono'] text-xs font-bold tracking-[0.14em] text-slate-700 uppercase">
                Scenario
              </label>
              <select
                id="scenario"
                className="w-full rounded-lg border-2 border-slate-900/20 bg-white px-3 py-2 text-sm text-slate-900"
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

            <form className="flex flex-wrap items-end gap-2" onSubmit={handleAddTodo}>
              <div className="min-w-[180px] flex-1">
                <label htmlFor="new-todo" className="mb-2 block font-['JetBrains_Mono'] text-xs font-bold tracking-[0.14em] text-slate-700 uppercase">
                  New todo
                </label>
                <input
                  ref={inputRef}
                  id="new-todo"
                  value={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                  className="w-full rounded-lg border-2 border-slate-900/20 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="-skew-x-6 rounded-md border-2 border-slate-900 bg-cyan-300 px-5 py-2 text-sm font-extrabold text-slate-950 transition hover:translate-x-1 hover:translate-y-1"
              >
                <span className="inline-block skew-x-6">Add</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section
        aria-label="Todo results"
        className="relative min-h-[220px] overflow-hidden rounded-[26px] border-2 border-slate-900/20 bg-white/80 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.15)] sm:p-6"
      >
        <div className="pointer-events-none absolute top-0 right-0 h-full w-28 bg-gradient-to-l from-cyan-100/60 to-transparent" />

        {loading ? <p role="status" className="relative z-10 text-slate-700">Loading todos...</p> : null}

        {!loading && error ? (
          <div role="alert" className="relative z-10 rounded-xl border-2 border-rose-300 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-900">
            {error}
          </div>
        ) : null}

        {!loading && !error && todos.length === 0 ? <p className="relative z-10 text-slate-700">No todos yet.</p> : null}

        {!loading && !error && todos.length > 0 ? (
          <ul aria-label="Todo list" className="relative z-10 m-0 list-disc space-y-2 pl-5 text-sm text-slate-900">
            {todos.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
