// Prerendered at build time (react-router.config.ts); the timestamp shows the build moment.
export function ServerComponent() {
  return (
    <main className="space-y-2">
      <h1 className="text-2xl font-semibold">About</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Built at {new Date().toISOString()}, served from the CDN edge.</p>
    </main>
  );
}
