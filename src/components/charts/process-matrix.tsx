"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// === Konfigurace ===
const MARGIN = { top: 30, right: 30, bottom: 45, left: 55 };
const DOMAIN_MIN = 0.5;
const DOMAIN_MAX = 5.5;
const TICKS = [1, 2, 3, 4, 5];
const MIN_BUBBLE_R = 8;
const MAX_BUBBLE_R = 28;

const QUADRANT_COLORS = {
  quickWins: { light: "rgba(34,197,94,0.07)", dark: "rgba(34,197,94,0.10)" },
  bigProjects: { light: "rgba(59,130,246,0.07)", dark: "rgba(59,130,246,0.10)" },
  minor: { light: "rgba(156,163,175,0.06)", dark: "rgba(156,163,175,0.08)" },
  timeWasters: { light: "rgba(239,68,68,0.07)", dark: "rgba(239,68,68,0.10)" },
};

const BUBBLE_COLOR = "#1C60FF";
const BUBBLE_COLOR_SELECTED = "#ef4444";

// === Types ===
export interface Process {
  name: string;
  impact: number;
  effort: number;
  lossDays: number;
  lossKc: number;
  who: string;
  frequency: string;
  tools: string;
}

export interface ProcessMatrixProps {
  processes: Process[];
  licenseCostYearly: number;
  dailyRate?: number;
}

function formatKc(value: number): string {
  return value.toLocaleString("cs-CZ") + " Kč";
}

export function ProcessMatrix({
  processes,
  licenseCostYearly,
  dailyRate = 7000,
}: ProcessMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    (v: number) => MARGIN.left + ((v - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * plotW,
    [plotW],
  );
  const yScale = useCallback(
    (v: number) => MARGIN.top + ((DOMAIN_MAX - v) / (DOMAIN_MAX - DOMAIN_MIN)) * plotH,
    [plotH],
  );

  // Bubble radius scale (proportional to lossDays)
  const maxLoss = useMemo(
    () => Math.max(...processes.map((p) => p.lossDays), 1),
    [processes],
  );
  const bubbleR = useCallback(
    (lossDays: number) => {
      const ratio = lossDays / maxLoss;
      return MIN_BUBBLE_R + ratio * (MAX_BUBBLE_R - MIN_BUBBLE_R);
    },
    [maxLoss],
  );

  // ROI
  const totalLossKc = useMemo(
    () => processes.reduce((sum, p) => sum + p.lossKc, 0),
    [processes],
  );
  const totalLossDays = useMemo(
    () => processes.reduce((sum, p) => sum + p.lossDays, 0),
    [processes],
  );
  const roiMonths = useMemo(() => {
    if (totalLossKc <= 0) return Infinity;
    return (licenseCostYearly / totalLossKc) * 12;
  }, [licenseCostYearly, totalLossKc]);

  const selectedProcess = selectedIndex !== null ? processes[selectedIndex] : null;
  const ready = size.width > 0 && size.height > 0;

  // Quadrant boundaries
  const midX = xScale(3);
  const midY = yScale(3);
  const leftEdge = xScale(DOMAIN_MIN);
  const rightEdge = xScale(DOMAIN_MAX);
  const topEdge = yScale(DOMAIN_MAX);
  const bottomEdge = yScale(DOMAIN_MIN);

  const mode = isDark ? "dark" : "light";

  return (
    <div className="w-full my-8 min-w-0 overflow-hidden">
      {/* Matice */}
      <div
        ref={containerRef}
        className="h-[400px] md:h-[480px] relative min-w-[300px]"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {ready && (
          <svg
            width={size.width}
            height={size.height}
            className="absolute inset-0"
          >
            {/* Kvadranty */}
            {/* Quick wins: vysoky impact, nizky effort (vlevo nahore) */}
            <rect
              x={leftEdge}
              y={topEdge}
              width={midX - leftEdge}
              height={midY - topEdge}
              fill={QUADRANT_COLORS.quickWins[mode]}
            />
            {/* Velke projekty: vysoky impact, vysoky effort (vpravo nahore) */}
            <rect
              x={midX}
              y={topEdge}
              width={rightEdge - midX}
              height={midY - topEdge}
              fill={QUADRANT_COLORS.bigProjects[mode]}
            />
            {/* Drobnosti: nizky impact, nizky effort (vlevo dole) */}
            <rect
              x={leftEdge}
              y={midY}
              width={midX - leftEdge}
              height={bottomEdge - midY}
              fill={QUADRANT_COLORS.minor[mode]}
            />
            {/* Casozrouti: nizky impact, vysoky effort (vpravo dole) */}
            <rect
              x={midX}
              y={midY}
              width={rightEdge - midX}
              height={bottomEdge - midY}
              fill={QUADRANT_COLORS.timeWasters[mode]}
            />

            {/* Quadrant labels */}
            <text
              x={leftEdge + 8}
              y={topEdge + 18}
              fontSize={11}
              fontWeight={500}
              fill={isDark ? "#86efac" : "#16a34a"}
              opacity={0.7}
            >
              Quick wins
            </text>
            <text
              x={rightEdge - 8}
              y={topEdge + 18}
              fontSize={11}
              fontWeight={500}
              fill={isDark ? "#93c5fd" : "#2563eb"}
              opacity={0.7}
              textAnchor="end"
            >
              Velké projekty
            </text>
            <text
              x={leftEdge + 8}
              y={bottomEdge - 8}
              fontSize={11}
              fontWeight={500}
              fill={isDark ? "#9ca3af" : "#6b7280"}
              opacity={0.7}
            >
              Drobnosti
            </text>
            <text
              x={rightEdge - 8}
              y={bottomEdge - 8}
              fontSize={11}
              fontWeight={500}
              fill={isDark ? "#fca5a5" : "#dc2626"}
              opacity={0.7}
              textAnchor="end"
            >
              Časožrouti
            </text>

            {/* Grid lines */}
            {TICKS.map((v) => (
              <g key={`grid-${v}`}>
                <line
                  x1={xScale(v)}
                  y1={MARGIN.top}
                  x2={xScale(v)}
                  y2={yScale(DOMAIN_MIN)}
                  stroke={isDark ? "#3a3228" : "#F5E0C8"}
                  strokeDasharray="4 4"
                />
                <line
                  x1={MARGIN.left}
                  y1={yScale(v)}
                  x2={xScale(DOMAIN_MAX)}
                  y2={yScale(v)}
                  stroke={isDark ? "#3a3228" : "#F5E0C8"}
                  strokeDasharray="4 4"
                />
                {/* X tick labels */}
                <text
                  x={xScale(v)}
                  y={yScale(DOMAIN_MIN) + 18}
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
              Effort (1 = snadné – 5 = náročné)
            </text>
            <text
              x={14}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              fontSize={13}
              fill="#8A7560"
              transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}
            >
              Impact (1 = nízký – 5 = vysoký)
            </text>

            {/* Bubbles */}
            {processes.map((process, i) => {
              const cx = xScale(process.effort);
              const cy = yScale(process.impact);
              const r = bubbleR(process.lossDays);
              const isSelected = selectedIndex === i;
              const isHovered = hoverIndex === i;

              return (
                <g key={process.name}>
                  {/* Hover/click zone */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={Math.max(r + 6, 18)}
                    fill="transparent"
                    cursor="pointer"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onClick={() =>
                      setSelectedIndex(selectedIndex === i ? null : i)
                    }
                  />
                  {/* Visible bubble */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered || isSelected ? r + 3 : r}
                    fill={isSelected ? BUBBLE_COLOR_SELECTED : BUBBLE_COLOR}
                    fillOpacity={isSelected ? 0.85 : 0.7}
                    stroke={isSelected ? BUBBLE_COLOR_SELECTED : BUBBLE_COLOR}
                    strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                    strokeOpacity={0.9}
                    style={{
                      transition: "r 200ms ease, fill 200ms ease",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Label inside bubble if large enough */}
                  {r >= 16 && (
                    <text
                      x={cx}
                      y={cy + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={Math.min(10, r * 0.6)}
                      fill="#fff"
                      fontWeight={600}
                      style={{ pointerEvents: "none" }}
                    >
                      {process.lossDays}d
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Hover tooltip */}
        {hoverIndex !== null && ready && (() => {
          const p = processes[hoverIndex];
          const cx = xScale(p.effort);
          const cy = yScale(p.impact);
          const r = bubbleR(p.lossDays);
          // Position tooltip to the right of bubble, flip if near right edge
          const flipX = cx > size.width * 0.7;
          return (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                left: flipX ? cx - r - 12 : cx + r + 12,
                top: cy - 20,
                transform: flipX ? "translateX(-100%)" : undefined,
              }}
            >
              <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
                <p className="font-semibold">{p.name}</p>
                <p className="text-fd-muted-foreground text-xs">
                  Ztráta: {p.lossDays} dnů/rok = {formatKc(p.lossKc)}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legenda velikosti */}
      <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs text-fd-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12">
            <circle cx="6" cy="6" r="4" fill={BUBBLE_COLOR} fillOpacity={0.7} />
          </svg>
          <span>Velikost = roční ztráta v člověkodnech</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12">
            <circle cx="6" cy="6" r="5" fill={BUBBLE_COLOR_SELECTED} fillOpacity={0.85} />
          </svg>
          <span>Klikni pro detail</span>
        </div>
      </div>

      {/* Detail vybraneho procesu */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: selectedProcess ? 300 : 0,
          opacity: selectedProcess ? 1 : 0,
        }}
      >
        {selectedProcess && (
          <div className="mt-4 rounded-xl border bg-fd-card p-4 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold">{selectedProcess.name}</h3>
              <button
                onClick={() => setSelectedIndex(null)}
                className="text-fd-muted-foreground hover:text-fd-foreground text-sm shrink-0"
                aria-label="Zavřít detail"
              >
                Zavřít
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-fd-muted-foreground">Kdo je postižen:</span>{" "}
                <span className="font-medium">{selectedProcess.who}</span>
              </div>
              <div>
                <span className="text-fd-muted-foreground">Frekvence:</span>{" "}
                <span className="font-medium">{selectedProcess.frequency}</span>
              </div>
              <div>
                <span className="text-fd-muted-foreground">Roční ztráta:</span>{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {selectedProcess.lossDays} člověkodní = {formatKc(selectedProcess.lossKc)}
                </span>
              </div>
              <div>
                <span className="text-fd-muted-foreground">Doporučený nástroj:</span>{" "}
                <span className="font-medium">{selectedProcess.tools}</span>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-fd-muted-foreground">
              <span>Impact: {selectedProcess.impact}/5</span>
              <span>Effort: {selectedProcess.effort}/5</span>
            </div>
          </div>
        )}
      </div>

      {/* ROI radek */}
      <div className="mt-6 rounded-xl border-2 border-fd-primary/20 bg-fd-card p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-fd-muted-foreground uppercase tracking-wide mb-1">
              Celková roční ztráta
            </p>
            <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
              {formatKc(totalLossKc)}
            </p>
            <p className="text-xs text-fd-muted-foreground mt-0.5">
              {totalLossDays} člověkodní ({dailyRate.toLocaleString("cs-CZ")} Kč/den)
            </p>
          </div>
          <div>
            <p className="text-xs text-fd-muted-foreground uppercase tracking-wide mb-1">
              Roční náklady na licence
            </p>
            <p className="text-xl md:text-2xl font-bold">
              {formatKc(licenseCostYearly)}
            </p>
          </div>
          <div>
            <p className="text-xs text-fd-muted-foreground uppercase tracking-wide mb-1">
              Návratnost
            </p>
            <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
              {roiMonths === Infinity
                ? "N/A"
                : roiMonths < 1
                  ? "< 1 měsíc"
                  : `${roiMonths.toFixed(1)} měsíců`}
            </p>
            <p className="text-xs text-fd-muted-foreground mt-0.5">
              licence se vrátí za
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
