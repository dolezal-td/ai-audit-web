"use client";

import { Info } from "lucide-react";
import { Tooltip } from "radix-ui";

interface MetricData {
  title: string;
  value: number;
  benchmark: number;
  description?: string;
  lowerIsBetter?: boolean;
}

interface MetricCardsProps {
  data: MetricData[];
}

function MetricTooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs rounded-lg border px-3 py-2 text-sm shadow-md"
            style={{
              backgroundColor: "var(--ak-tooltip-bg)",
              borderColor: "var(--ak-tooltip-border)",
            }}
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow
              style={{ fill: "var(--ak-tooltip-border)" }}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

const gridColsClass = (count: number) => {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
};

export function MetricCards({ data }: MetricCardsProps) {
  return (
    <div className={`grid gap-4 my-8 ${gridColsClass(data.length)}`}>
      {data.map((metric) => {
        const diff = metric.value - metric.benchmark;
        const isGood = metric.lowerIsBetter ? diff <= 0 : diff >= 0;
        const pct = Math.min((metric.value / 10) * 100, 100);
        const benchmarkPct = Math.min((metric.benchmark / 10) * 100, 100);

        return (
          <div
            key={metric.title}
            className="rounded-2xl border bg-fd-card p-6 flex flex-col gap-3 sm:aspect-square justify-between"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-medium text-fd-muted-foreground leading-tight">
                {metric.title}
              </span>
              {metric.description && (
                <MetricTooltip content={metric.description}>
                  <button className="shrink-0 text-fd-muted-foreground hover:text-fd-foreground transition-colors">
                    <Info size={16} />
                  </button>
                </MetricTooltip>
              )}
            </div>

            <span className="text-5xl font-bold tracking-tight">
              {metric.value.toFixed(1)}
            </span>

            <div className="flex flex-col gap-2">
              <div className="relative h-2.5 rounded-full bg-fd-muted">
                <div
                  className="absolute h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: "var(--ak-primary)",
                  }}
                />
                <div
                  className="absolute w-0.5 h-5 -top-1.5 rounded-full"
                  style={{
                    left: `${benchmarkPct}%`,
                    backgroundColor: "var(--ak-benchmark)",
                  }}
                  title={`Benchmark: ${metric.benchmark.toFixed(1)}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-fd-muted-foreground">
                  Trh: {metric.benchmark.toFixed(1)}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isGood
                      ? "var(--ak-positive)"
                      : "var(--ak-negative)",
                  }}
                >
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="col-span-full flex items-center gap-2 text-xs text-fd-muted-foreground justify-end -mt-1">
        <span
          className="inline-block w-0.5 h-3.5 rounded-full"
          style={{ backgroundColor: "var(--ak-benchmark)" }}
        />
        <span>Benchmark trhu</span>
      </div>
    </div>
  );
}
