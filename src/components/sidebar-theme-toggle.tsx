"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Tooltip } from "radix-ui";

export function SidebarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="ak-icon-btn"
          >
            {isDark ? <Sun /> : <Moon />}
          </button>
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
            {isDark ? "Světlý režim" : "Tmavý režim"}
            <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
