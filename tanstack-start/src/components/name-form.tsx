"use client";

import { useRouter } from "@tanstack/react-router";
import { setName } from "#/me-fns";
import { NameField, SubmitButton } from "./field";

// TanStack has no route actions: call the POST server function, then rerun the loader.
export function NameForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await setName({ data: new FormData(e.currentTarget).get("name") });
        await router.invalidate();
      }}
    >
      <NameField defaultValue={defaultValue} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
