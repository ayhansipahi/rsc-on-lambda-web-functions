import { redirect } from "react-router";
import { NameField, SubmitButton } from "../field";

const readName = (request: Request) =>
  decodeURIComponent(request.headers.get("cookie")?.match(/(?:^|;\s*)name=([^;]+)/)?.[1] ?? "");

// Personalized page: must never be cached by a shared CDN.
export function headers() {
  return { "Cache-Control": "private, no-store" };
}

export function loader({ request }: { request: Request }) {
  return { name: readName(request) };
}

export async function action({ request }: { request: Request }) {
  const name = String((await request.formData()).get("name") ?? "").slice(0, 32);
  // POST/redirect/GET: in RSC mode (RR 8.5.1) loaderData is null when rendering the action response.
  return redirect("/me", {
    headers: { "Set-Cookie": `name=${encodeURIComponent(name)}; Path=/; HttpOnly; Secure; SameSite=Lax` },
  });
}

export function ServerComponent({ loaderData }: { loaderData: { name: string } }) {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">hello {loaderData.name || "stranger"}</h1>
      <form method="post" className="flex items-end gap-2">
        <NameField defaultValue={loaderData.name} />
        <SubmitButton>Save</SubmitButton>
      </form>
    </main>
  );
}
