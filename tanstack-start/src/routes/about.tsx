import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'

// Rendered on demand and cached 5 min by the CDN (routeRules in vite.config.ts), not prerendered.
function AboutPage() {
  return (
    <main className="space-y-2">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Rendered at {new Date().toISOString()}, cached at the CDN edge.</p>
    </main>
  )
}

const getAbout = createServerFn().handler(() => renderServerComponent(<AboutPage />))

export const Route = createFileRoute('/about')({
  loader: () => getAbout(),
  component: () => Route.useLoaderData(),
})
