import { InfoDialog } from "../dialog";

export function meta() {
  return [{ title: "RSC on Lambda Web Functions" }];
}

export function ServerComponent() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">React Router RSC on Lambda Web Functions</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Every page is a server component. Only the nav, buttons, dialog, field and tooltip ship client JS.
      </p>
      <InfoDialog title="What each page shows">
        <p>Stream: two Suspense boundaries arrive 1 s and 3 s after the shell.</p>
        <p>Cookie: a loader reads an HttpOnly cookie; the page is never cached by the CDN.</p>
        <p>Dash: the layout skips re-rendering on child navigation, client state survives.</p>
        <p>About: prerendered at build time and served from the CloudFront edge.</p>
      </InfoDialog>
    </main>
  );
}
