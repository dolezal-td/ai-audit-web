import type { ReactNode } from "react";

type CalloutType = "insight" | "warning" | "positive";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const config: Record<CalloutType, { icon: string; bg: string; border: string; text: string }> = {
  insight: {
    icon: "💡",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900",
    text: "text-blue-900 dark:text-blue-200",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
    text: "text-red-900 dark:text-red-200",
  },
  positive: {
    icon: "✅",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900",
    text: "text-green-900 dark:text-green-200",
  },
};

export function Callout({ type = "insight", title, children }: CalloutProps) {
  const { icon, bg, border, text } = config[type];

  return (
    <div className={`flex items-start gap-3 rounded-lg border ${bg} ${border} ${text} p-4 my-6 not-prose`}>
      <span className="text-base shrink-0 select-none h-5 flex items-center" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        {title && (
          <p className="font-semibold text-sm mb-1.5">{title}</p>
        )}
        <div className="text-sm leading-relaxed [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
