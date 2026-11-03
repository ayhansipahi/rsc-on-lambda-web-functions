"use client";

import { Tooltip } from "@base-ui/react/tooltip";

export function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<span />} className="cursor-help underline decoration-dotted underline-offset-4">
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="bottom" sideOffset={8}>
          <Tooltip.Popup className="max-w-xs rounded-md bg-neutral-900 px-2 py-1 text-xs text-white transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-white dark:text-neutral-900">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
