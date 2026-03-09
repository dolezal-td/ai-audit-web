"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

const GROUP_COLORS: Record<string, string> = {
  Finance: "#6B8A9E",
  "HR + Support": "#C27D5F",
  default: "#8A7560",
};

// Mapování kategorií na skupiny
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

const DOT_RADIUS = 10;

export function ScatterPlotChart({
  data,
  companyAvgUmim,
  companyAvgChci,
  benchmarkUmim,
  benchmarkChci,
  groups: customGroups,
}: ScatterPlotProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const groupNames = useMemo(() => {
    if (customGroups) return Object.keys(customGroups);
    const names = new Set(data.map((d) => getGroup(d.kategorie)));
    return [...names].sort();
  }, [data, customGroups]);

  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    () => new Set(groupNames)
  );

  // Stabilní set pro visibility — odděleně od dat
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveGroups(new Set(groupNames));
  }, [groupNames]);

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
      const group = getGroup(person.kategorie);
      return GROUP_COLORS[group] || GROUP_COLORS.default;
    },
    [customGroups]
  );

  const handleDotMouseEnter = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (!visibleSet.has(index)) return;
      setHoveredIndex(index);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    [visibleSet]
  );

  const handleDotMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredIndex === null) return;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    [hoveredIndex]
  );

  const handleDotMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltipPos(null);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full my-8 h-[400px] md:h-[450px] rounded-xl border bg-fd-card animate-pulse" />
    );
  }

  const hoveredPerson = hoveredIndex !== null ? data[hoveredIndex] : null;

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
        className="h-[400px] md:h-[450px] relative"
        ref={containerRef}
        onMouseMove={handleDotMouseMove}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#F5E0C8" />
            <XAxis
              type="number"
              dataKey="index_chci"
              name="Chci"
              domain={[0, 10]}
              tickCount={6}
              label={{
                value: "Index Chci (1–10)",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 13, fill: "#8A7560" },
              }}
              tick={{ fontSize: 12, fill: "#8A7560" }}
            />
            <YAxis
              type="number"
              dataKey="index_umim"
              name="Umím"
              domain={[0, 10]}
              tickCount={6}
              label={{
                value: "Index Umím (1–10)",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                style: { fontSize: 13, fill: "#8A7560" },
              }}
              tick={{ fontSize: 12, fill: "#8A7560" }}
            />
            {/* Benchmark trhu */}
            {benchmarkUmim && (
              <ReferenceLine
                y={benchmarkUmim}
                stroke="#D4C4A8"
                strokeDasharray="4 4"
                label={{
                  value: `Trh ${benchmarkUmim.toFixed(1)}`,
                  position: "right",
                  style: { fontSize: 10, fill: "#D4C4A8" },
                }}
              />
            )}
            {benchmarkChci && (
              <ReferenceLine
                x={benchmarkChci}
                stroke="#D4C4A8"
                strokeDasharray="4 4"
                label={{
                  value: `Trh ${benchmarkChci.toFixed(1)}`,
                  position: "top",
                  style: { fontSize: 10, fill: "#D4C4A8" },
                }}
              />
            )}
            {/* Průměr JTRE — kosočtverec */}
            {companyAvgUmim && companyAvgChci && (
              <ReferenceDot
                x={companyAvgChci}
                y={companyAvgUmim}
                r={0}
                fill="transparent"
                stroke="transparent"
                shape={(props: { cx?: number; cy?: number }) => {
                  const { cx = 0, cy = 0 } = props;
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
                }}
              />
            )}
            <Scatter
              data={data}
              fill="#1C60FF"
              isAnimationActive={false}
              // @ts-expect-error recharts typing issue with custom shape
              shape={(props: {
                cx: number;
                cy: number;
                payload: PersonData;
                index: number;
              }) => {
                const { cx, cy, payload, index } = props;
                const isVisible = visibleSet.has(index);
                const isHovered = hoveredIndex === index;
                const color = getPersonColor(payload);
                return (
                  <g>
                    {/* Hover zóna */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={20}
                      fill="transparent"
                      onMouseEnter={(e) => handleDotMouseEnter(index, e)}
                      onMouseLeave={handleDotMouseLeave}
                      style={{
                        cursor: isVisible ? "pointer" : "default",
                        pointerEvents: isVisible ? "auto" : "none",
                      }}
                    />
                    {/* Tečka */}
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
              }}
            >
              {data.map((_, index) => (
                <Cell key={index} fill="transparent" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* HTML tooltip — mimo SVG, vždy navrchu */}
        <div
          className="pointer-events-none absolute top-0 left-0 z-10"
          style={{
            transform: tooltipPos
              ? `translate(${tooltipPos.x + 16}px, ${tooltipPos.y - 40}px)`
              : undefined,
            opacity: hoveredPerson ? 1 : 0,
            transition: "opacity 150ms ease",
          }}
        >
          {hoveredPerson && (
            <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
              <p className="font-semibold">{hoveredPerson.jmeno}</p>
              <p className="text-fd-muted-foreground text-xs">
                {hoveredPerson.kategorie}
              </p>
              <div className="mt-1 space-y-0.5">
                <p>
                  Umím:{" "}
                  <strong>{hoveredPerson.index_umim.toFixed(2)}</strong>
                </p>
                <p>
                  Chci:{" "}
                  <strong>{hoveredPerson.index_chci.toFixed(1)}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-fd-muted-foreground">
        {companyAvgUmim && companyAvgChci && (
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
        {(benchmarkUmim || benchmarkChci) && (
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
