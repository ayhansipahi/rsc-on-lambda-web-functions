"use client";

import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { buttonClass } from "./styles";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <Button type="submit" className={buttonClass}>
      {children}
    </Button>
  );
}

export function NameField({ defaultValue }: { defaultValue: string }) {
  return (
    <Field.Root name="name" className="flex flex-col gap-1">
      <Field.Label className="text-sm font-medium">Name</Field.Label>
      <Field.Control
        defaultValue={defaultValue}
        maxLength={32}
        required
        className="h-9 w-64 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-2 focus:outline-blue-600 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <Field.Description className="text-xs text-neutral-500">Stored in an HttpOnly cookie.</Field.Description>
    </Field.Root>
  );
}
