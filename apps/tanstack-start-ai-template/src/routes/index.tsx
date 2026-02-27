import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="space-y-6 pb-2">
      <section className="relative grid gap-6 overflow-hidden rounded-[34px] border-2 border-slate-900/20 bg-white/78 px-6 py-8 shadow-[0_32px_74px_rgba(15,23,42,0.18)] lg:grid-cols-[1.32fr_0.88fr] lg:px-8">
        <div className="pointer-events-none absolute -top-26 -right-28 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-[drift_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-rose-300/22 blur-3xl animate-[drift_7s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-emerald-200/40 to-transparent" />

        <div className="relative">
          <p className="mb-4 inline-flex rounded-full border border-slate-900/20 bg-slate-950 px-4 py-1 font-['JetBrains_Mono'] text-[0.66rem] font-bold tracking-[0.19em] text-emerald-200 uppercase">
            TanStack Start + AI
          </p>
          <h1 className="mb-5 max-w-3xl font-['Bungee'] text-5xl leading-[0.92] tracking-tight text-slate-950 sm:text-7xl">
            Fast autonomous app delivery.
          </h1>
          <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
            Build with aggressive confidence loops: integration behavior tests,
            a real browser truth test, and visual contracts that make UI change
            review explicit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/todos"
              search={{ scenario: 'happy' }}
              className="-skew-x-6 rounded-md border-2 border-slate-900 bg-cyan-300 px-6 py-2 text-sm font-extrabold text-slate-950 no-underline shadow-[6px_6px_0_0_rgba(15,23,42,0.95)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <span className="inline-block skew-x-6">Open Todos Demo</span>
            </Link>
            <a
              href="https://tanstack.com/start/latest"
              target="_blank"
              rel="noreferrer"
              className="-skew-x-6 rounded-md border-2 border-slate-900 bg-rose-200 px-6 py-2 text-sm font-extrabold text-slate-950 no-underline shadow-[6px_6px_0_0_rgba(15,23,42,0.95)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <span className="inline-block skew-x-6">Read Docs</span>
            </a>
          </div>
        </div>

        <aside className="relative rounded-2xl border-2 border-slate-900/15 bg-slate-950 p-5 text-slate-100 shadow-[0_16px_28px_rgba(15,23,42,0.34)]">
          <p className="mb-2 font-['JetBrains_Mono'] text-[0.62rem] tracking-[0.2em] text-cyan-200 uppercase">
            Loop Contract
          </p>
          <ul className="m-0 space-y-3 p-0 text-sm list-none">
            <li className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2">
              Integration-first behavior tests
            </li>
            <li className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2">
              Browser mode confidence signal
            </li>
            <li className="rounded-lg border border-rose-300/30 bg-rose-300/10 px-3 py-2">
              Visual baselines committed by design
            </li>
          </ul>

          <div className="mt-5 rounded-xl border border-white/20 bg-white/8 p-3 font-['JetBrains_Mono'] text-xs text-slate-200">
            <p className="m-0">Definition of done:</p>
            <p className="mt-2 mb-0 text-cyan-200">typecheck → test → browser → e2e</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Typecheck gate', 'No type-level tests. `typecheck` is the contract.', 'bg-cyan-100'],
          ['MSW everywhere', 'Node, browser mode, and Playwright all share handlers.', 'bg-emerald-100'],
          ['Visual TDD', 'Screenshots are committed and updated intentionally only.', 'bg-rose-100'],
        ].map(([title, body, bg], index) => (
          <article
            key={title}
            className={`rounded-2xl border-2 border-slate-900/15 ${bg} p-5 shadow-[0_12px_26px_rgba(15,23,42,0.15)] ${index === 1 ? 'md:-translate-y-2' : ''}`}
          >
            <p className="mb-2 font-['JetBrains_Mono'] text-[0.65rem] font-bold tracking-[0.18em] text-slate-700 uppercase">
              0{index + 1}
            </p>
            <h2 className="mb-2 text-lg font-extrabold text-slate-900">{title}</h2>
            <p className="m-0 text-sm text-slate-700">{body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
