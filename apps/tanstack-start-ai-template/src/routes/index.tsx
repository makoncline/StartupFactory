import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-semibold">App Template</h1>
      <p className="text-base text-slate-700">
        This app intentionally starts with minimal content and no visual theme.
      </p>
      <p className="text-sm text-slate-600">Start by replacing this page with your app content.</p>
    </main>
  )
}
