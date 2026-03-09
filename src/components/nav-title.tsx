"use client";

import { useRouter } from "next/navigation";

interface NavTitleProps {
  showHome: boolean;
}

export function NavTitle({ showHome }: NavTitleProps) {
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      AI Kompas
      {showHome && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push("/");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              router.push("/");
            }
          }}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors cursor-pointer"
          title="Přehled reportů"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </span>
      )}
    </span>
  );
}
