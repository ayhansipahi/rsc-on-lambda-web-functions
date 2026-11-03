import { Suspense } from "react";

// Async server component: resolves after `ms`, so its HTML arrives in a later chunk.
async function Slow({ ms }: { ms: number }) {
  await new Promise((r) => setTimeout(r, ms));
  return <p>slow-{ms}ms rendered at {new Date().toISOString()}</p>;
}

export function ServerComponent() {
  return (
    <main className="space-y-2">
      <h1 className="text-2xl font-semibold">shell rendered at {new Date().toISOString()}</h1>
      <Suspense fallback={<p>loading-1000</p>}>
        <Slow ms={1000} />
      </Suspense>
      <Suspense fallback={<p>loading-3000</p>}>
        <Slow ms={3000} />
      </Suspense>
    </main>
  );
}
