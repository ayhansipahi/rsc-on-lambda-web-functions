import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { renderServerComponent } from '@tanstack/react-start/rsc'
import { getCookie, setResponseHeader } from '@tanstack/react-start/server'
import { NameForm } from '#/components/name-form'
// Imported here so the server build registers it; a server function imported only from a
// "use client" module failed at runtime with "Server function info not found".
import '#/me-fns'

function MePage({ name }: { name: string }) {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">hello {name || 'stranger'}</h1>
      <NameForm defaultValue={name} />
    </main>
  )
}

const getMe = createServerFn().handler(() => {
  // Personalized: neither the document nor this server-function response may sit in a shared cache.
  setResponseHeader('Cache-Control', 'private, no-store')
  return renderServerComponent(<MePage name={getCookie('name') ?? ''} />)
})

export const Route = createFileRoute('/me')({
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  loader: () => getMe(),
  component: () => Route.useLoaderData(),
})
