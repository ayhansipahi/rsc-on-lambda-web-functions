import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'RSC on Lambda Web Functions (TanStack)' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

const pages = [
  ['/', 'Home'],
  ['/stream', 'Stream'],
  ['/me', 'Cookie'],
  ['/dash/a', 'Dash'],
  ['/about', 'About'],
] as const

const linkClass = 'rounded-md px-3 py-1.5 text-sm'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {/* .root isolates stacking so Base UI portals (dialog, tooltip) sit above the page. */}
        <div className="root">
          <nav className="flex gap-1 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
            {pages.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === '/' }}
                className={linkClass}
                activeProps={{ className: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' }}
                inactiveProps={{ className: 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800' }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto max-w-3xl space-y-4 p-6">{children}</div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
