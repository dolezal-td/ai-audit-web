"use client";

import { FileDown } from "lucide-react";
import { Tooltip } from "radix-ui";

interface SidebarPdfLinkProps {
  reportSlug: string;
}

export function SidebarPdfLink({ reportSlug }: SidebarPdfLinkProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a
            href={`/print/${reportSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ak-icon-btn"
          >
            <FileDown />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-lg border px-3 py-2 text-sm shadow-md"
            style={{
              backgroundColor: "var(--ak-tooltip-bg)",
              borderColor: "var(--ak-tooltip-border)",
            }}
            side="right"
            sideOffset={8}
          >
            Stáhnout PDF
            <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
