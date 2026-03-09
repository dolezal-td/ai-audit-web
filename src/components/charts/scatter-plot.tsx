"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// === Konfigurace ===
const MARGIN = { top: 20, right: 25, bottom: 40, left: 50 };
const DOMAIN_MAX = 10;
const TICKS = [0, 2, 4, 6, 8, 10];
const DOT_RADIUS = 10;
const HOVER_RADIUS = 22;

const GROUP_COLORS: Record<string, string> = {
  Finance: "#6B8A9E",
  "HR + Support": "#C27D5F",
  default: "#8A7560",
};

const CATEGORY_TO_GROUP: Record<string, string> = {
  Management: "Finance",
  Analytik: "Finance",
  Controlling: "Finance",
  Finance: "Finance",
  HR: "HR + Support",
  Support: "HR + Support",
  AML: "Finance",
  Manažer: "Finance",
  Obchod: "Finance",
  Exekutiva: "Finance",
  Marketing: "HR + Support",
  IT: "Finance",
};

function getGroup(kategorie: string): string {
  return CATEGORY_TO_GROUP[kategorie] || "Finance";
}

interface PersonData {
  jmeno: string;
  kategorie: string;
  index_umim: number;
  index_chci: number;
}

interface ScatterPlotProps {
  data: PersonData[];
  companyAvgUmim?: number;
  companyAvgChci?: number;
  benchmarkUmim?: number;
  benchmarkChci?: number;
  groups?: Record<string, string[]>;
}

interface HoverInfo {
  index: number;
  x: number;
  y: number;
}

export function ScatterPlotChart({
  data,
  companyAvgUmim,
  companyAvgChci,
  benchmarkUmim,
  benchmarkChci,
  groups: customGroups,
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const lastHoverRef = useRef<HoverInfo | null>(null);
  if (hoverInfo) lastHoverRef.current = hoverInfo;

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scales
  const plotW = size.width - MARGIN.left - MARGIN.right;
  const plotH = size.height - MARGIN.top - MARGIN.bottom;
  const xScale = useCallback(
    (v: number) => MARGIN.left + (v / DOMAIN_MAX) * plotW,
    [plotW]
  );
  const yScale = useCallback(
    (v: number) => MARGIN.top + ((DOMAIN_MAX - v) / DOMAIN_MAX) * plotH,
    [plotH]
  );

  // Skupiny
  const groupNames = useMemo(() => {
    if (customGroups) return Object.keys(customGroups);
    const names = new Set(data.map((d) => getGroup(d.kategorie)));
    return [...names].sort();
  }, [data, customGroups]);

  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    () => new Set(groupNames)
  );

  useEffect(() => {
    setActiveGroups(new Set(groupNames));
  }, [groupNames]);

  const visibleSet = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d, i) => {
      if (customGroups) {
        for (const [group, categories] of Object.entries(customGroups)) {
          if (categories.includes(d.kategorie) && activeGroups.has(group)) {
            set.add(i);
            break;
          }
        }
      } else if (activeGroups.has(getGroup(d.kategorie))) {
        set.add(i);
      }
    });
    return set;
  }, [data, activeGroups, customGroups]);

  const allActive = activeGroups.size === groupNames.length;

  function toggleGroup(group: string) {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        if (next.size > 1) next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  function resetGroups() {
    setActiveGroups(new Set(groupNames));
  }

  const getPersonColor = useCallback(
    (person: PersonData): string => {
      if (customGroups) {
        for (const [group, categories] of Object.entries(customGroups)) {
          if (categories.includes(person.kategorie)) {
            return GROUP_COLORS[group] || GROUP_COLORS.default;
          }
        }
        return GROUP_COLORS.default;
      }
      return GROUP_COLORS[getGroup(person.kategorie)] || GROUP_COLORS.default;
    },
    [customGroups]
  );

  const displayInfo = hoverInfo || lastHoverRef.current;
  const displayPerson = displayInfo ? data[displayInfo.index] : null;
  const ready = size.width > 0 && size.height > 0;

  return (
    <div className="w-full my-8">
      {/* Filtrování skupin */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {groupNames.map((group) => {
          const isActive = activeGroups.has(group);
          const color = GROUP_COLORS[group] || GROUP_COLORS.default;
          return (
            <label
              key={group}
              className={`flex items-center gap-2 cursor-pointer select-none rounded-lg border px-3 py-1.5 text-sm transition-all ${
                isActive
                  ? "border-fd-border bg-fd-card shadow-sm"
                  : "border-transparent bg-fd-muted/50 opacity-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleGroup(group)}
                className="sr-only"
              />
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{group}</span>
            </label>
          );
        })}
        {!allActive && (
          <button
            onClick={resetGroups}
            className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors underline underline-offset-2"
          >
            Zobrazit vše
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="h-[400px] md:h-[450px] relative"
        onMouseLeave={() => setHoverInfo(null)}
      >
        {ready && (
          <svg
            width={size.width}
            height={size.height}
            className="absolute inset-0"
          >
            {/* Grid čáry */}
            {TICKS.map((v) => (
              <g key={`grid-${v}`}>
                {/* Vertikální */}
                <line
                  x1={xScale(v)}
                  y1={MARGIN.top}
                  x2={xScale(v)}
                  y2={yScale(0)}
                  stroke="#F5E0C8"
                  strokeDasharray="4 4"
                />
                {/* Horizontální */}
                <line
                  x1={MARGIN.left}
                  y1={yScale(v)}
                  x2={xScale(DOMAIN_MAX)}
                  y2={yScale(v)}
                  stroke="#F5E0C8"
                  strokeDasharray="4 4"
                />
                {/* X tick labels */}
                <text
                  x={xScale(v)}
                  y={yScale(0) + 18}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#8A7560"
                >
                  {v}
                </text>
                {/* Y tick labels */}
                <text
                  x={MARGIN.left - 10}
                  y={yScale(v) + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="#8A7560"
                >
                  {v}
                </text>
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={MARGIN.left + plotW / 2}
              y={size.height - 4}
              textAnchor="middle"
              fontSize={13}
              fill="#8A7560"
            >
              Index Chci (1–10)
            </text>
            <text
              x={14}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              fontSize={13}
              fill="#8A7560"
              transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}
            >
              Index Umím (1–10)
            </text>

            {/* Benchmark trhu — reference lines */}
            {benchmarkUmim != null && (
              <>
                <line
                  x1={MARGIN.left}
                  y1={yScale(benchmarkUmim)}
                  x2={xScale(DOMAIN_MAX)}
                  y2={yScale(benchmarkUmim)}
                  stroke="#D4C4A8"
                  strokeDasharray="4 4"
                />
                <text
                  x={xScale(DOMAIN_MAX) - 4}
                  y={yScale(benchmarkUmim) - 6}
                  textAnchor="end"
                  fontSize={10}
                  fill="#D4C4A8"
                >
                  Trh {benchmarkUmim.toFixed(1)}
                </text>
              </>
            )}
            {benchmarkChci != null && (
              <>
                <line
                  x1={xScale(benchmarkChci)}
                  y1={MARGIN.top}
                  x2={xScale(benchmarkChci)}
                  y2={yScale(0)}
                  stroke="#D4C4A8"
                  strokeDasharray="4 4"
                />
                <text
                  x={xScale(benchmarkChci) + 4}
                  y={MARGIN.top + 12}
                  textAnchor="start"
                  fontSize={10}
                  fill="#D4C4A8"
                >
                  Trh {benchmarkChci.toFixed(1)}
                </text>
              </>
            )}

            {/* Průměr JTRE — kosočtverec */}
            {companyAvgUmim != null && companyAvgChci != null && (() => {
              const cx = xScale(companyAvgChci);
              const cy = yScale(companyAvgUmim);
              const s = 9;
              return (
                <g>
                  <polygon
                    points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
                    fill="#C4956A"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    x={cx}
                    y={cy - s - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#C4956A"
                    fontWeight={600}
                  >
                    JTRE
                  </text>
                </g>
              );
            })()}

            {/* === TEČKY — stabilní key, CSS transitions fungují === */}
            {data.map((person, i) => {
              const cx = xScale(person.index_chci);
              const cy = yScale(person.index_umim);
              const isVisible = visibleSet.has(i);
              const isHovered = hoverInfo?.index === i;
              const color = getPersonColor(person);

              return (
                <g key={person.jmeno}>
                  {/* Hover zóna — neviditelná, větší */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={HOVER_RADIUS}
                    fill="transparent"
                    onMouseEnter={() => {
                      if (isVisible)
                        setHoverInfo({ index: i, x: cx, y: cy });
                    }}
                    onMouseLeave={() => setHoverInfo(null)}
                    style={{
                      cursor: isVisible ? "pointer" : "default",
                      pointerEvents: isVisible ? "auto" : "none",
                    }}
                  />
                  {/* Viditelná tečka */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? DOT_RADIUS + 2 : DOT_RADIUS}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: "opacity 400ms ease",
                      pointerEvents: "none",
                    }}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* HTML tooltip — vždy v DOM, fade in/out */}
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: displayInfo ? displayInfo.x + DOT_RADIUS + 12 : 0,
            top: displayInfo ? displayInfo.y - 30 : 0,
            opacity: hoverInfo ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          {displayPerson && (
            <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
              <p className="font-semibold">{displayPerson.jmeno}</p>
              <p className="text-fd-muted-foreground text-xs">
                {displayPerson.kategorie}
              </p>
              <div className="mt-1 space-y-0.5">
                <p>
                  Umím:{" "}
                  <strong>{displayPerson.index_umim.toFixed(2)}</strong>
                </p>
                <p>
                  Chci:{" "}
                  <strong>{displayPerson.index_chci.toFixed(1)}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-fd-muted-foreground">
        {companyAvgUmim != null && companyAvgChci != null && (
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon
                points="7,1 13,7 7,13 1,7"
                fill="#C4956A"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
            <span>Průměr JTRE</span>
          </div>
        )}
        {(benchmarkUmim != null || benchmarkChci != null) && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 border-t-2 border-dashed"
              style={{ borderColor: "#D4C4A8" }}
            />
            <span>Benchmark trhu</span>
          </div>
        )}
      </div>
    </div>
  );
}
