"use client";

import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "radix-ui";
import { Check, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Info } from "lucide-react";

// --------------- Types ---------------

interface ColumnDef {
  key: string;
  label: string;
  lowerIsBetter?: boolean;
  emphasized?: boolean;
  description?: string;
}

interface PersonData {
  jmeno: string;
  kategorie?: string;
  [key: string]: string | number | boolean | undefined;
}

interface PeopleHeatmapProps {
  data: PersonData[];
  columns: ColumnDef[];
  previousData?: PersonData[];
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
}

// --------------- Color algorithm ---------------

function getHeatmapStyle(
  value: number,
  min: number,
  max: number,
  lowerIsBetter: boolean,
  isDark: boolean,
): React.CSSProperties {
  if (max === min) return {};

  let t = (value - min) / (max - min);
  if (lowerIsBetter) t = 1 - t;
  t = Math.max(0, Math.min(1, t));

  // Distance from neutral center (0 at t=0.5, 1 at edges)
  const dist = Math.abs(t - 0.5) * 2;
  const hue = t < 0.5 ? 0 : 142;
  const saturation = dist * 70;

  const lightness = isDark
    ? 18 + (1 - dist) * 12
    : 96 - dist * 42;

  // White text on saturated backgrounds for readability
  const fg =
    dist > 0.35
      ? "#ffffff"
      : isDark
        ? "#e5e7eb"
        : "#1f2937";

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: fg,
  };
}

// --------------- Subcomponents ---------------

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) {
    return (
      <span className="ml-0.5 inline-flex flex-col opacity-0 group-hover:opacity-40 transition-opacity">
        <ChevronUp size={10} strokeWidth={2} />
        <ChevronDown size={10} strokeWidth={2} className="-mt-1" />
      </span>
    );
  }
  return (
    <span className="ml-0.5 inline-flex opacity-70">
      {dir === "asc" ? (
        <ChevronUp size={12} strokeWidth={2.5} />
      ) : (
        <ChevronDown size={12} strokeWidth={2.5} />
      )}
    </span>
  );
}

function DeltaIndicator({
  current,
  previous,
  lowerIsBetter,
}: {
  current: number;
  previous: number;
  lowerIsBetter: boolean;
}) {
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return null;

  const isImprovement = lowerIsBetter ? delta < 0 : delta > 0;

  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-medium leading-none mt-0.5"
      style={{ opacity: 0.75 }}
    >
      {isImprovement ? (
        <ArrowUp size={9} strokeWidth={2.5} />
      ) : (
        <ArrowDown size={9} strokeWidth={2.5} />
      )}
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}
    </span>
  );
}

function NotMeasuredLabel() {
  return (
    <span className="text-[9px] leading-none mt-0.5 opacity-50 italic whitespace-nowrap">
      dříve neměřeno
    </span>
  );
}

function CopyFeedback({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="absolute top-0.5 right-0.5 text-blue-500 animate-fade-in">
      <Check size={10} strokeWidth={3} />
    </span>
  );
}

// --------------- Main component ---------------

export function PeopleHeatmap({
  data,
  columns,
  previousData,
  defaultSortKey = "index_umim",
  defaultSortDir = "desc",
}: PeopleHeatmapProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Previous data lookup by name
  const previousMap = useMemo(() => {
    if (!previousData) return new Map<string, PersonData>();
    const map = new Map<string, PersonData>();
    for (const p of previousData) {
      map.set(p.jmeno, p);
    }
    return map;
  }, [previousData]);

  // Column stats (min, max) for normalization
  const colStats = useMemo(() => {
    const stats = new Map<string, { min: number; max: number }>();
    for (const col of columns) {
      const values = data
        .map((p) => p[col.key])
        .filter((v): v is number => typeof v === "number");
      if (values.length === 0) {
        stats.set(col.key, { min: 0, max: 10 });
      } else {
        stats.set(col.key, {
          min: Math.min(...values),
          max: Math.max(...values),
        });
      }
    }
    return stats;
  }, [data, columns]);

  // Sorted data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return 0;
    });
  }, [data, sortKey, sortDir]);

  // Average row
  const averages = useMemo(() => {
    const avg: Record<string, number> = {};
    for (const col of columns) {
      const values = data
        .map((p) => p[col.key])
        .filter((v): v is number => typeof v === "number");
      avg[col.key] =
        values.length > 0
          ? values.reduce((s, v) => s + v, 0) / values.length
          : 0;
    }
    return avg;
  }, [data, columns]);

  // Previous averages (only for people who have previous data)
  const previousAverages = useMemo(() => {
    if (!previousData || previousData.length === 0) return null;
    const avg: Record<string, number> = {};
    for (const col of columns) {
      const values = previousData
        .map((p) => p[col.key])
        .filter((v): v is number => typeof v === "number");
      if (values.length > 0) {
        avg[col.key] = values.reduce((s, v) => s + v, 0) / values.length;
      }
    }
    return avg;
  }, [previousData, columns]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleCopy(cellId: string, value: number) {
    navigator.clipboard.writeText(value.toFixed(2)).catch(() => {});
    setCopiedCell(cellId);
    setTimeout(() => setCopiedCell(null), 800);
  }

  if (!mounted) {
    return <div className="w-full h-64 animate-pulse bg-fd-muted" />;
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-fd-muted/50">
              <th className="sticky left-0 z-10 bg-fd-muted/50 text-left py-2.5 px-3 font-medium text-fd-muted-foreground w-[160px] min-w-[160px]">
                Jméno
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="group py-2.5 px-2 font-medium text-fd-muted-foreground text-center min-w-[90px] cursor-pointer select-none hover:bg-fd-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-0.5 text-xs">
                    {col.label}
                    {col.description && (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            className="inline-flex text-fd-muted-foreground/50 hover:text-fd-muted-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            tabIndex={-1}
                          >
                            <Info size={11} strokeWidth={2} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="z-50 max-w-[220px] rounded-lg border px-3 py-2 text-xs font-normal text-left shadow-md"
                            style={{
                              backgroundColor: "var(--ak-tooltip-bg)",
                              borderColor: "var(--ak-tooltip-border)",
                            }}
                            sideOffset={5}
                          >
                            {col.description}
                            <Tooltip.Arrow
                              style={{ fill: "var(--ak-tooltip-border)" }}
                            />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    )}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.map((person) => {
              const prev = previousMap.get(person.jmeno);
              return (
                <tr key={person.jmeno} className="border-t border-fd-border hover:bg-fd-muted/20 transition-colors">
                  <td className="sticky left-0 z-10 bg-fd-background py-2 px-3 font-medium text-sm border-r border-fd-border">
                    <div className="leading-tight">{person.jmeno}</div>
                    {person.kategorie && (
                      <div className="text-[11px] text-fd-muted-foreground font-normal">
                        {person.kategorie}
                      </div>
                    )}
                  </td>
                  {columns.map((col) => {
                    const value = person[col.key];
                    if (typeof value !== "number") {
                      return (
                        <td
                          key={col.key}
                          className="py-2 px-2 text-center text-fd-muted-foreground text-xs"
                        >
                          —
                        </td>
                      );
                    }

                    const stats = colStats.get(col.key)!;
                    const cellId = `${person.jmeno}-${col.key}`;
                    const isCopied = copiedCell === cellId;
                    const prevValue = prev?.[col.key];
                    const hasPrev = typeof prevValue === "number";
                    // Person has previous record but this metric wasn't measured
                    const notMeasured = !!prev && !hasPrev;

                    return (
                      <Tooltip.Root key={col.key}>
                        <Tooltip.Trigger asChild>
                          <td
                            className={`relative py-2 px-2 text-center cursor-pointer select-all transition-all ${
                              col.emphasized ? "font-bold" : "font-medium"
                            } text-sm ${
                              isCopied ? "ring-2 ring-blue-500/50 ring-inset" : ""
                            }`}
                            style={getHeatmapStyle(
                              value,
                              stats.min,
                              stats.max,
                              !!col.lowerIsBetter,
                              isDark,
                            )}
                            onClick={() => handleCopy(cellId, value)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleCopy(cellId, value);
                              }
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <span>{value.toFixed(value % 1 === 0 ? 0 : 2)}</span>
                              {hasPrev ? (
                                <DeltaIndicator
                                  current={value}
                                  previous={prevValue}
                                  lowerIsBetter={!!col.lowerIsBetter}
                                />
                              ) : notMeasured ? (
                                <NotMeasuredLabel />
                              ) : null}
                            </div>
                            <CopyFeedback visible={isCopied} />
                          </td>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="z-50 max-w-xs rounded-lg border px-3 py-2 text-sm shadow-md"
                            style={{
                              backgroundColor: "var(--ak-tooltip-bg)",
                              borderColor: "var(--ak-tooltip-border)",
                            }}
                            sideOffset={5}
                          >
                            <div className="font-semibold">{person.jmeno}</div>
                            {person.kategorie && (
                              <div className="text-xs opacity-70 mb-1">
                                {person.kategorie}
                              </div>
                            )}
                            <div className="border-t pt-1 mt-1" style={{ borderColor: "var(--ak-tooltip-border)" }}>
                              <span className="font-medium">{col.label}:</span>{" "}
                              {value.toFixed(2)}
                            </div>
                            {hasPrev ? (
                              <div className="text-xs opacity-70 mt-0.5">
                                Minulý audit: {prevValue.toFixed(2)} (
                                {(value - prevValue) > 0 ? "+" : ""}
                                {(value - prevValue).toFixed(2)})
                              </div>
                            ) : notMeasured ? (
                              <div className="text-xs opacity-50 italic mt-0.5">
                                Dříve neměřeno
                              </div>
                            ) : null}
                            <Tooltip.Arrow
                              style={{ fill: "var(--ak-tooltip-border)" }}
                            />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Average row */}
          <tfoot>
            <tr className="border-t-2 border-fd-border bg-fd-muted/30">
              <td className="sticky left-0 z-10 bg-fd-muted/30 py-2.5 px-3 font-bold text-sm border-r border-fd-border">
                Průměr
              </td>
              {columns.map((col) => {
                const avg = averages[col.key];
                const stats = colStats.get(col.key)!;
                const prevAvg = previousAverages?.[col.key];
                const hasPrevAvg = typeof prevAvg === "number";
                return (
                  <td
                    key={col.key}
                    className={`py-2.5 px-2 text-center ${
                      col.emphasized ? "font-bold" : "font-semibold"
                    } text-sm`}
                    style={getHeatmapStyle(
                      avg,
                      stats.min,
                      stats.max,
                      !!col.lowerIsBetter,
                      isDark,
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>{avg.toFixed(2)}</span>
                      {hasPrevAvg ? (
                        <DeltaIndicator
                          current={avg}
                          previous={prevAvg}
                          lowerIsBetter={!!col.lowerIsBetter}
                        />
                      ) : previousAverages ? (
                        <NotMeasuredLabel />
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </Tooltip.Provider>
  );
}
