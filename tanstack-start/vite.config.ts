import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // node-middleware: Nitro exports a handler instead of listening, so index.js can bind
    // AWS_LAMBDA_HTTP_ENDPOINT and add streaming-safe compression in front of it.
    // serveStatic: this preset leaves .output/public to the host server by default.
    nitro({
      preset: 'node-middleware',
      serveStatic: true,
      // Stand-in for prerendering, which fails with this preset ("Failed to fetch /about"):
      // render on demand and let the CDN keep it 5 min; browsers always revalidate.
      routeRules: { '/about/**': { headers: { 'cache-control': 'public, max-age=0, s-maxage=300' } } },
    }),
    tailwindcss(),
    tanstackStart({ rsc: { enabled: true } }),
    rsc(),
    viteReact(),
  ],
})
