"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 55 };
const MIN_RADIUS = 8;
const MAX_RADIUS = 32;
const HOVER_EXTRA = 8;

const PRETTY_LABELS: Record<string, string> = {
  psaní_mailů: "E-maily",
  psaní_chatových_zpráv: "Chat",
  vyhodnocování_dat: "Vyhodnocování dat",
  příprava_prezentací: "Prezentace",
  dohledávání_informací_v_interních_materiálech: "Dohledávání informací",
  monitoring_veřejných_zdrojů: "Monitoring zdrojů",
  analýza_souborů: "Analýza souborů",
  extrakce_informací_z_dokumentů: "Extrakce z dokumentů",
  psaní_marketingových_textů: "Marketing texty",
  projektové_řízení: "Projektové řízení",
  porady: "Porady",
  pohovory_s_kandidáty: "Pohovory",
  služební_cesty: "Služební cesty",
  překlady: "Překlady",
};

function prettify(key: string): string {
  return PRETTY_LABELS[key] || key.replace(/_/g, " ");
}

// Quadrant colors
const QUADRANT_COLORS = {
  topRight: "rgba(34, 139, 34, 0.06)",    // green tint - start here
  topLeft: "rgba(59, 130, 246, 0.06)",     // blue tint - strategic
  bottomRight: "rgba(107, 90, 72, 0.06)",  // warm brown - routine
  bottomLeft: "transparent",               // low priority
};

const BUBBLE_COLOR = "#8B6F47";
const BUBBLE_HOVER_COLOR = "#6B5A3E";

interface ActivityBubbleData {
  nazev: string;
  distribuce: {
    denne: number;
    tyden: number;
    mesic: number;
    mene: number;
  };
  ai_potencial: number;
}

interface ActivityBubbleChartProps {
  data: ActivityBubbleData[];
  totalRespondents: number;
}

interface HoverInfo {
  index: number;
  x: number;
  y: number;
}

export function ActivityBubbleChart({
  data,
  totalRespondents,
}: ActivityBubbleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const lastHoverRef = useRef<HoverInfo | null>(null);
  if (hoverInfo) lastHoverRef.current = hoverInfo;

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

  // Computed data points
  const points = useMemo(() => {
    return data.map((item) => {
      const weeklyPlus = item.distribuce.denne + item.distribuce.tyden;
      const frekvence = (weeklyPlus / totalRespondents) * 100;
      const monthlyPlus = weeklyPlus + item.distribuce.mesic;
      return {
        nazev: item.nazev,
        frekvence, // % doing it weekly+
        ai_potencial: item.ai_potencial,
        pocetLidi: monthlyPlus, // bubble size = monthly+
        raw: item,
      };
    });
  }, [data, totalRespondents]);

  // Max people for bubble scaling
  const maxPocet = useMemo(
    () => Math.max(...points.map((p) => p.pocetLidi), 1),
    [points],
  );

  const plotW = size.width - MARGIN.left - MARGIN.right;
  const plotH = size.height - MARGIN.top - MARGIN.bottom;

  const xScale = useCallback(
    (v: number) => MARGIN.left + (v / 100) * plotW,
    [plotW],
  );
  const yScale = useCallback(
    (v: number) => MARGIN.top + ((10 - v) / 10) * plotH,
    [plotH],
  );
  const radiusScale = useCallback(
    (count: number) =>
      MIN_RADIUS + ((count / maxPocet) ** 0.5) * (MAX_RADIUS - MIN_RADIUS),
    [maxPocet],
  );

  // Midpoints for quadrant dividers
  const midX = xScale(50);
  const midY = yScale(5);

  const displayInfo = hoverInfo || lastHoverRef.current;
  const displayPoint = displayInfo ? points[displayInfo.index] : null;
  const ready = size.width > 0 && size.height > 0;

  // X axis ticks
  const xTicks = [0, 25, 50, 75, 100];
  const yTicks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="w-full my-8 min-w-0 overflow-hidden">
      <div
        ref={containerRef}
        className="h-[420px] md:h-[480px] relative"
        onMouseLeave={() => setHoverInfo(null)}
      >
        {ready && (
          <svg
            width={size.width}
            height={size.height}
            className="absolute inset-0"
          >
            {/* Quadrant backgrounds */}
            <rect
              x={midX}
              y={MARGIN.top}
              width={xScale(100) - midX}
              height={midY - MARGIN.top}
              fill={QUADRANT_COLORS.topRight}
            />
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={midX - MARGIN.left}
              height={midY - MARGIN.top}
              fill={QUADRANT_COLORS.topLeft}
            />
            <rect
              x={midX}
              y={midY}
              width={xScale(100) - midX}
              height={yScale(0) - midY}
              fill={QUADRANT_COLORS.bottomRight}
            />
            <rect
              x={MARGIN.left}
              y={midY}
              width={midX - MARGIN.left}
              height={yScale(0) - midY}
              fill={QUADRANT_COLORS.bottomLeft}
            />

            {/* Grid lines */}
            {xTicks.map((v) => (
              <g key={`x-${v}`}>
                <line
                  x1={xScale(v)}
                  y1={MARGIN.top}
                  x2={xScale(v)}
                  y2={yScale(0)}
                  stroke="#F5E0C8"
                  strokeDasharray="4 4"
                />
                <text
                  x={xScale(v)}
                  y={yScale(0) + 18}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#8A7560"
                >
                  {v}%
                </text>
              </g>
            ))}
            {yTicks.map((v) => (
              <g key={`y-${v}`}>
                <line
                  x1={MARGIN.left}
                  y1={yScale(v)}
                  x2={xScale(100)}
                  y2={yScale(v)}
                  stroke="#F5E0C8"
                  strokeDasharray="4 4"
                />
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

            {/* Quadrant dividers */}
            <line
              x1={midX}
              y1={MARGIN.top}
              x2={midX}
              y2={yScale(0)}
              stroke="#D4C4A8"
              strokeWidth={1}
              strokeDasharray="6 4"
            />
            <line
              x1={MARGIN.left}
              y1={midY}
              x2={xScale(100)}
              y2={midY}
              stroke="#D4C4A8"
              strokeWidth={1}
              strokeDasharray="6 4"
            />

            {/* Quadrant labels */}
            <text
              x={xScale(75)}
              y={MARGIN.top + 18}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#2d8a4e"
              opacity={0.7}
            >
              Začněte tady
            </text>
            <text
              x={xScale(25)}
              y={MARGIN.top + 18}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#3b82f6"
              opacity={0.7}
            >
              Strategická příležitost
            </text>
            <text
              x={xScale(75)}
              y={yScale(0) - 8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#8A7560"
              opacity={0.6}
            >
              Rutina bez AI
            </text>
            <text
              x={xScale(25)}
              y={yScale(0) - 8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#8A7560"
              opacity={0.4}
            >
              Nízká priorita
            </text>

            {/* Axis labels */}
            <text
              x={MARGIN.left + plotW / 2}
              y={size.height - 4}
              textAnchor="middle"
              fontSize={13}
              fill="#8A7560"
            >
              Frekvence – % týmu alespoň týdně
            </text>
            <text
              x={14}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              fontSize={13}
              fill="#8A7560"
              transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}
            >
              AI potenciál (1–10)
            </text>

            {/* Bubbles — sorted so smaller ones render on top */}
            {[...points]
              .map((p, i) => ({ ...p, origIndex: i }))
              .sort((a, b) => b.pocetLidi - a.pocetLidi)
              .map(({ origIndex, frekvence, ai_potencial, pocetLidi }) => {
                const cx = xScale(frekvence);
                const cy = yScale(ai_potencial);
                const r = radiusScale(pocetLidi);
                const isHovered = hoverInfo?.index === origIndex;

                return (
                  <g key={origIndex}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + HOVER_EXTRA}
                      fill="transparent"
                      onMouseEnter={() =>
                        setHoverInfo({ index: origIndex, x: cx, y: cy })
                      }
                      onMouseLeave={() => setHoverInfo(null)}
                      style={{ cursor: "pointer" }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? r + 3 : r}
                      fill={isHovered ? BUBBLE_HOVER_COLOR : BUBBLE_COLOR}
                      opacity={isHovered ? 0.85 : 0.6}
                      stroke="#fff"
                      strokeWidth={2}
                      style={{
                        pointerEvents: "none",
                        transition: "r 200ms ease, opacity 200ms ease",
                      }}
                    />
                    {/* Label below bubble */}
                    <text
                      x={cx}
                      y={cy + (isHovered ? r + 3 : r) + 14}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#6B5A48"
                      fontWeight={500}
                      style={{ pointerEvents: "none" }}
                    >
                      {prettify(points[origIndex].nazev)}
                    </text>
                  </g>
                );
              })}
          </svg>
        )}

        {/* Tooltip */}
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: displayInfo
              ? Math.min(
                  displayInfo.x + radiusScale(displayPoint?.pocetLidi ?? 0) + 12,
                  size.width - 200,
                )
              : 0,
            top: displayInfo ? Math.max(displayInfo.y - 40, 10) : 0,
            opacity: hoverInfo ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          {displayPoint && (
            <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
              <p className="font-semibold">{prettify(displayPoint.nazev)}</p>
              <div className="mt-1 space-y-0.5 text-fd-muted-foreground">
                <p>
                  Frekvence:{" "}
                  <strong className="text-fd-foreground">
                    {displayPoint.frekvence.toFixed(0)}% týmu
                  </strong>{" "}
                  alespoň týdně
                </p>
                <p>
                  AI potenciál:{" "}
                  <strong className="text-fd-foreground">
                    {displayPoint.ai_potencial}/10
                  </strong>
                </p>
                <p>
                  Dělá měsíčně+:{" "}
                  <strong className="text-fd-foreground">
                    {displayPoint.pocetLidi}/{totalRespondents} lidí
                  </strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center mt-4 text-xs text-fd-muted-foreground">
        <div className="flex items-center gap-2">
          <svg width="40" height="16" viewBox="0 0 40 16">
            <circle cx="8" cy="8" r="4" fill={BUBBLE_COLOR} opacity={0.6} />
            <circle cx="22" cy="8" r="7" fill={BUBBLE_COLOR} opacity={0.6} />
          </svg>
          <span>Velikost = počet lidí (měsíčně+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: "rgba(34, 139, 34, 0.15)" }}
          />
          <span>Začněte tady</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
          />
          <span>Strategická příležitost</span>
        </div>
      </div>
    </div>
  );
}
