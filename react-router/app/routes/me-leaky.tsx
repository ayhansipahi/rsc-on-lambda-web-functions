// ponytail: deliberately broken. Module-level state is shared by every concurrent
// request in one Web Functions environment, so names leak across users.
let current = "";

export async function loader({ request }: { request: Request }) {
  current = decodeURIComponent(request.headers.get("cookie")?.match(/(?:^|;\s*)name=([^;]+)/)?.[1] ?? "");
  await new Promise((r) => setTimeout(r, 50)); // stand-in for a DB call
  return { name: current };
}

export function ServerComponent({ loaderData }: { loaderData: { name: string } }) {
  return <p>hello {loaderData.name}</p>;
}
