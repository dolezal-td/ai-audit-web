"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Tooltip } from "radix-ui";

interface NavTitleProps {
  showHome: boolean;
  reportSlug: string;
}

export function NavTitle({ showHome, reportSlug }: NavTitleProps) {
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      {showHome && (
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/");
                }}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
              >
                <span className="relative">
                  <Home size={16} strokeWidth={1.5} />
                  <ArrowLeft
                    size={9}
                    strokeWidth={2.5}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2"
                  />
                </span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="z-50 rounded-lg border px-3 py-2 text-sm shadow-md"
                style={{
                  backgroundColor: "var(--ak-tooltip-bg)",
                  borderColor: "var(--ak-tooltip-border)",
                }}
                sideOffset={5}
              >
                Přehled reportů
                <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
      <span className="inline-flex items-center gap-2">
        <Image
          src="/logo.png"
          alt=""
          width={24}
          height={24}
          className="rounded-md"
        />
        AI Kompas
      </span>
    </span>
  );
}
