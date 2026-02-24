import type { ReactNode } from "react";

type CalloutType = "insight" | "warning" | "positive";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const config: Record<CalloutType, { border: string; bg: string; label: string }> = {
  insight: {
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    label: "Zjisteni",
  },
  warning: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    label: "Pozor",
  },
  positive: {
    border: "border-l-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    label: "Silna stranka",
  },
};

export function Callout({ type = "insight", title, children }: CalloutProps) {
  const { border, bg } = config[type];

  return (
    <div
      className={`rounded-lg border-l-4 ${border} ${bg} p-4 my-6 not-prose`}
    >
      {title && (
        <p className="font-semibold text-sm mb-1.5">{title}</p>
      )}
      <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
    </div>
  );
}
