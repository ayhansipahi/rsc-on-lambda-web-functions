"use client";

import { Dialog } from "@base-ui/react/dialog";
import { buttonClass } from "./styles";

export function InfoDialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={buttonClass}>{title}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-6 shadow-lg transition-all data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-neutral-800 dark:bg-neutral-900">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description render={<div />} className="mt-2 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {children}
          </Dialog.Description>
          <div className="mt-4 flex justify-end">
            <Dialog.Close className={buttonClass}>Close</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
