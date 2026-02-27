import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start AI Template' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  if ((globalThis as any).__START_TEST_ENV__) {
    return <>{children}</>
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className="mx-auto w-[min(1160px,calc(100%-1rem))] py-4 md:py-7">
      <header className="relative mb-7 overflow-hidden rounded-[28px] border-2 border-slate-900/15 bg-white/74 px-4 py-4 shadow-[0_22px_56px_rgba(13,20,34,0.18)] backdrop-blur-md md:px-6">
        <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-cyan-300/32 blur-2xl animate-[drift_7s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-rose-300/25 blur-2xl animate-[drift_9s_ease-in-out_infinite]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 font-['JetBrains_Mono'] text-[0.66rem] font-bold tracking-[0.22em] text-slate-700 uppercase">
            AI Verification Template
          </p>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase md:text-sm">
            <Link
              to="/"
              className="rounded-full border border-slate-900/15 bg-white/45 px-3 py-1.5 text-slate-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-100"
              activeProps={{ className: 'rounded-full border border-cyan-500/50 bg-cyan-100 px-3 py-1.5 text-cyan-900 no-underline shadow-sm animate-[pulseBorder_2.6s_ease-out_infinite]' }}
            >
              Home
            </Link>
            <Link
              to="/todos"
              search={{ scenario: 'happy' }}
              className="rounded-full border border-slate-900/15 bg-white/45 px-3 py-1.5 text-slate-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-100"
              activeProps={{ className: 'rounded-full border border-cyan-500/50 bg-cyan-100 px-3 py-1.5 text-cyan-900 no-underline shadow-sm animate-[pulseBorder_2.6s_ease-out_infinite]' }}
            >
              Todos
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
