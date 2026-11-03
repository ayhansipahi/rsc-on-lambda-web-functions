import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'
import { Counter } from '#/components/counter'
import { Hint } from '#/components/hint'

function DashHeader() {
  return (
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      <Hint label="With staleTime Infinity, this timestamp stays put while you switch between a and b.">
        layout rendered at {new Date().toISOString()}
      </Hint>
    </p>
  )
}

const getDashHeader = createServerFn().handler(() => renderServerComponent(<DashHeader />))

const tab =
  'rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'

export const Route = createFileRoute('/dash')({
  loader: () => getDashHeader(),
  // TanStack's counterpart of RR shouldRevalidate=false: the default staleTime 0 reruns this
  // loader (a server function round trip) on every child navigation.
  staleTime: Infinity,
  component: DashLayout,
})

function DashLayout() {
  return (
    <section className="space-y-4">
      {Route.useLoaderData()}
      <div className="flex items-center gap-2">
        <Counter />
        <Link to="/dash/$id" params={{ id: 'a' }} className={tab}>a</Link>
        <Link to="/dash/$id" params={{ id: 'b' }} className={tab}>b</Link>
      </div>
      <Outlet />
    </section>
  )
}
