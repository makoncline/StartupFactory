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
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6 border-b border-slate-200 pb-3">
        <p className="mb-2 text-sm font-semibold">AI Verification Template</p>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="underline" activeProps={{ className: 'underline font-semibold' }}>
            Home
          </Link>
        </nav>
      </header>

      <Outlet />
    </div>
  )
}
