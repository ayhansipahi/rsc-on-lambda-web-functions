import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'

const getChild = createServerFn()
  .validator((id: string) => String(id).slice(0, 16))
  .handler(({ data }) =>
    renderServerComponent(
      <p className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        child {data} rendered at {new Date().toISOString()}
      </p>,
    ),
  )

export const Route = createFileRoute('/dash/$id')({
  loader: ({ params }) => getChild({ data: params.id }),
  component: () => Route.useLoaderData(),
})
