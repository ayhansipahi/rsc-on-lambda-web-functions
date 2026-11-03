import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'

// Plain module (not a route, not "use client") so the client form can import the RPC stub.
export const setName = createServerFn({ method: 'POST' })
  .validator((name: unknown) => String(name ?? '').slice(0, 32))
  .handler(({ data }) => {
    setCookie('name', data, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' })
  })
