import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'
import { InfoDialog } from '#/components/dialog'

function HomePage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">TanStack Start RSC on Lambda Web Functions</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Page bodies are server components returned by server functions. Only the router, nav, buttons, dialog,
        field and tooltip ship client JS.
      </p>
      <InfoDialog title="What each page shows">
        <p>Stream: two Suspense boundaries arrive 1 s and 3 s after the shell.</p>
        <p>Cookie: a server function reads an HttpOnly cookie; the page is never cached by the CDN.</p>
        <p>Dash: the layout loader is not re-run on child navigation, client state survives.</p>
        <p>About: prerendered at build time and served from the CloudFront edge.</p>
      </InfoDialog>
    </main>
  )
}

const getHome = createServerFn().handler(() => renderServerComponent(<HomePage />))

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  component: () => Route.useLoaderData(),
})
