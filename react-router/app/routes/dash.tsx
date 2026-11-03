import { Link, Outlet } from "react-router";
import { Counter } from "../counter";
import { Hint } from "../hint";

// Skip re-rendering the layout on child-to-child navigation.
// RR 8.5.1 drops this export from route discovery patches (getManifestRoute), so it only
// applied when /dash was the first page loaded; node_modules/react-router is patched for this demo.
export function shouldRevalidate() {
  return false;
}

const tab = "rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800";

export function ServerComponent() {
  return (
    <section className="space-y-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        <Hint label="With shouldRevalidate false, this timestamp stays put while you switch between a and b.">
          layout rendered at {new Date().toISOString()}
        </Hint>
      </p>
      <div className="flex items-center gap-2">
        <Counter />
        <Link to="/dash/a" className={tab}>a</Link>
        <Link to="/dash/b" className={tab}>b</Link>
      </div>
      <Outlet />
    </section>
  );
}
