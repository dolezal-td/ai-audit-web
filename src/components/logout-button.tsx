"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Tooltip } from "radix-ui";

interface LogoutButtonProps {
  variant?: "text" | "icon";
}

export function LogoutButton({ variant = "text" }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  if (variant === "icon") {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button onClick={handleLogout} className="ak-icon-btn">
              <LogOut />
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
              Odhlásit se
              <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs transition-colors duration-150 cursor-pointer hover:underline"
      style={{ color: "var(--ak-warm-400)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--ak-warm-600)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--ak-warm-400)";
      }}
    >
      Odhlásit se
    </button>
  );
}
