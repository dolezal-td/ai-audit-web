"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MetricCards } from "@/components/ui/metric-cards";

// === Konfigurace ===
const MARGIN = { top: 20, right: 25, bottom: 40, left: 50 };
const DOMAIN_MAX = 10;
const TICKS = [0, 2, 4, 6, 8, 10];
const DOT_RADIUS = 10;
const HOVER_RADIUS = 22;

const TEAM_COLORS = [
  "#1C60FF", // ak-primary
  "#C27D5F", // warm accent
  "#7C3AED", // purple
  "#0891B2", // cyan
  "#D0BBEB", // ak-purple
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
];

const DEFAULT_GROUP_COLORS: Record<string, string> = {
  default: "#8A7560",
};

type TabId = "team" | "teams" | "people";

interface TeamData {
  name: string;
  indexUmim: number;
  indexChci: number;
  pocetLidi: number;
  indexRozptylu?: number;
}

interface PersonData {
  jmeno: string;
  kategorie: string;
  index_umim: number;
  index_chci: number;
}

interface TeamMapChartProps {
  // Zoom 1
  teamName: string;
  teamUmim: number;
  teamChci: number;
  teamRozptyl: number;
  benchmarkUmim: number;
  benchmarkChci: number;
  benchmarkRozptyl?: number;

  // Dlaždice — volitelné metriky navíc
  prehlcenost?: number;
  benchmarkPrehlcenost?: number;
  prescasy?: number;
  benchmarkPrescasy?: number;
  strachZAi?: number;
  benchmarkStrachZAi?: number;

  // Zoom 2 (optional)
  teams?: TeamData[];

  // Zoom 3
  individuals: PersonData[];

  // Grouping pro barvy na zoom 3
  groups?: Record<string, string[]>;
  groupColors?: Record<string, string>;
}

// === Helpers ===

// === Hlavní komponenta ===

export function TeamMapChart({
  teamName,
  teamUmim,
  teamChci,
  teamRozptyl,
  benchmarkUmim,
  benchmarkChci,
  benchmarkRozptyl = 1.0,
  prehlcenost,
  benchmarkPrehlcenost,
  prescasy,
  benchmarkPrescasy,
  strachZAi,
  benchmarkStrachZAi,
  teams,
  individuals,
  groups: customGroups,
  groupColors: customGroupColors,
}: TeamMapChartProps) {
  const GROUP_COLORS = useMemo(
    () => ({ ...DEFAULT_GROUP_COLORS, ...customGroupColors }),
    [customGroupColors],
  );

  const hasTeams = teams && teams.length > 0;
  const tabs: { id: TabId; label: string }[] = useMemo(() => {
    const t: { id: TabId; label: string }[] = [
      { id: "team", label: "Tým vs. trh" },
    ];
    if (hasTeams) t.push({ id: "teams", label: "Týmy" });
    t.push({ id: "people", label: "Lidé" });
    return t;
  }, [hasTeams]);

  const [activeTab, setActiveTab] = useState<TabId>("team");

  // SVG container
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
    [plotW],
  );
  const yScale = useCallback(
    (v: number) => MARGIN.top + ((DOMAIN_MAX - v) / DOMAIN_MAX) * plotH,
    [plotH],
  );

  // Hover
  const [hoverInfo, setHoverInfo] = useState<{
    type: "team" | "person" | "benchmark";
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const lastHoverRef = useRef<typeof hoverInfo>(null);
  if (hoverInfo) lastHoverRef.current = hoverInfo;
  const displayInfo = hoverInfo || lastHoverRef.current;

  // Group logic pro zoom 3
  const groupNames = useMemo(() => {
    if (customGroups) return Object.keys(customGroups);
    const names = new Set(individuals.map((d) => d.kategorie));
    return [...names].sort();
  }, [individuals, customGroups]);

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
      const idx = groupNames.indexOf(person.kategorie);
      return TEAM_COLORS[idx % TEAM_COLORS.length];
    },
    [customGroups, GROUP_COLORS, groupNames],
  );

  const ready = size.width > 0 && size.height > 0;

  // Metriky — vždy viditelné
  const metrics: { title: string; value: number; benchmark: number; description?: string; lowerIsBetter?: boolean; color?: string; maxValue?: number }[] = useMemo(() => {
    const m: { title: string; value: number; benchmark: number; description?: string; lowerIsBetter?: boolean; color?: string; maxValue?: number }[] = [
      { title: "Index Umím", value: teamUmim, benchmark: benchmarkUmim, description: "Kombinace znalostí, praktických schopností a míry zkoušení AI nástrojů. Škála 0–10.", color: "#2563EB" },
      { title: "Index Chci", value: teamChci, benchmark: benchmarkChci, description: "Motivace k používání AI – ochota experimentovat, zájem o vzdělávání. Škála 0–10.", color: "#EA580C" },
      { title: "Index rozptylu", value: teamRozptyl, benchmark: benchmarkRozptyl, description: "Jak moc je tým nejednotný. 1 = jako trh, >1 = rozházenější, <1 = jednotnější.", lowerIsBetter: true, color: "#059669", maxValue: 2 },
    ];
    if (prehlcenost != null && benchmarkPrehlcenost != null) {
      m.push({ title: "Přehlcenost", value: prehlcenost, benchmark: benchmarkPrehlcenost, description: "Subjektivní pocit zahlcení prací. Nižší = lepší. Škála 1–10.", lowerIsBetter: true, color: "#991B1B" });
    }
    if (prescasy != null && benchmarkPrescasy != null) {
      m.push({ title: "Přesčasy", value: prescasy, benchmark: benchmarkPrescasy, description: "Frekvence práce přesčas. Nižší = lepší. Škála 1–10.", lowerIsBetter: true, color: "#6B7280" });
    }
    if (strachZAi != null && benchmarkStrachZAi != null) {
      m.push({ title: "Strach z AI", value: strachZAi, benchmark: benchmarkStrachZAi, description: "Obavy z dopadu AI na vlastní pozici. Nižší = lepší. Škála 1–10.", lowerIsBetter: true, color: "#DC2626" });
    }
    return m;
  }, [teamUmim, teamChci, teamRozptyl, benchmarkUmim, benchmarkChci, benchmarkRozptyl, prehlcenost, benchmarkPrehlcenost, prescasy, benchmarkPrescasy, strachZAi, benchmarkStrachZAi]);


  // === Rendering ===

  function renderGrid() {
    return (
      <>
        {TICKS.map((v) => (
          <g key={`grid-${v}`}>
            <line x1={xScale(v)} y1={MARGIN.top} x2={xScale(v)} y2={yScale(0)} stroke="var(--ak-grid)" strokeDasharray="4 4" />
            <line x1={MARGIN.left} y1={yScale(v)} x2={xScale(DOMAIN_MAX)} y2={yScale(v)} stroke="var(--ak-grid)" strokeDasharray="4 4" />
            <text x={xScale(v)} y={yScale(0) + 18} textAnchor="middle" fontSize={12} fill="var(--ak-warm-600)">{v}</text>
            <text x={MARGIN.left - 10} y={yScale(v) + 4} textAnchor="end" fontSize={12} fill="var(--ak-warm-600)">{v}</text>
          </g>
        ))}
        <text x={MARGIN.left + plotW / 2} y={size.height - 4} textAnchor="middle" fontSize={13} fill="var(--ak-warm-600)">
          Index Chci (1–10)
        </text>
        <text x={14} y={MARGIN.top + plotH / 2} textAnchor="middle" fontSize={13} fill="var(--ak-warm-600)" transform={`rotate(-90, 14, ${MARGIN.top + plotH / 2})`}>
          Index Umím (0–10)
        </text>
      </>
    );
  }

  function renderBenchmarkLines() {
    return (
      <>
        <line x1={MARGIN.left} y1={yScale(benchmarkUmim)} x2={xScale(DOMAIN_MAX)} y2={yScale(benchmarkUmim)} stroke="var(--ak-warm-400)" strokeDasharray="6 4" strokeWidth={1.5} />
        <text x={xScale(DOMAIN_MAX) - 4} y={yScale(benchmarkUmim) - 6} textAnchor="end" fontSize={10} fill="var(--ak-warm-400)">Trh {benchmarkUmim.toFixed(1)}</text>
        <line x1={xScale(benchmarkChci)} y1={MARGIN.top} x2={xScale(benchmarkChci)} y2={yScale(0)} stroke="var(--ak-warm-400)" strokeDasharray="6 4" strokeWidth={1.5} />
        <text x={xScale(benchmarkChci) + 4} y={MARGIN.top + 12} textAnchor="start" fontSize={10} fill="var(--ak-warm-400)">Trh {benchmarkChci.toFixed(1)}</text>
      </>
    );
  }

  function renderZoom1() {
    const teamCx = xScale(teamChci);
    const teamCy = yScale(teamUmim);
    const benchCx = xScale(benchmarkChci);
    const benchCy = yScale(benchmarkUmim);
    const diamondS = 11;

    return (
      <>
        <g>
          <circle cx={benchCx} cy={benchCy} r={HOVER_RADIUS} fill="transparent" onMouseEnter={() => setHoverInfo({ type: "benchmark", index: 0, x: benchCx, y: benchCy })} onMouseLeave={() => setHoverInfo(null)} style={{ cursor: "pointer" }} />
          <polygon points={`${benchCx},${benchCy - diamondS} ${benchCx + diamondS},${benchCy} ${benchCx},${benchCy + diamondS} ${benchCx - diamondS},${benchCy}`} fill="var(--ak-warm-400)" stroke="var(--ak-warm-50)" strokeWidth={2} style={{ pointerEvents: "none" }} />
          <text x={benchCx} y={benchCy - diamondS - 6} textAnchor="middle" fontSize={11} fill="var(--ak-warm-500)" fontWeight={600} style={{ pointerEvents: "none" }}>Benchmark</text>
        </g>
        <g>
          <circle cx={teamCx} cy={teamCy} r={HOVER_RADIUS} fill="transparent" onMouseEnter={() => setHoverInfo({ type: "team", index: 0, x: teamCx, y: teamCy })} onMouseLeave={() => setHoverInfo(null)} style={{ cursor: "pointer" }} />
          <circle cx={teamCx} cy={teamCy} r={DOT_RADIUS + 2} fill="var(--ak-primary)" stroke="var(--ak-warm-50)" strokeWidth={2.5} style={{ pointerEvents: "none" }} />
          <text x={teamCx} y={teamCy - DOT_RADIUS - 8} textAnchor="middle" fontSize={11} fill="var(--ak-primary)" fontWeight={600} style={{ pointerEvents: "none" }}>{teamName}</text>
        </g>
      </>
    );
  }

  function renderZoom2() {
    if (!teams) return null;
    return (
      <>
        {teams.map((team, i) => {
          const cx = xScale(team.indexChci);
          const cy = yScale(team.indexUmim);
          const color = TEAM_COLORS[i % TEAM_COLORS.length];
          const isHovered = hoverInfo?.type === "team" && hoverInfo.index === i;
          return (
            <g key={team.name}>
              <circle cx={cx} cy={cy} r={HOVER_RADIUS} fill="transparent" onMouseEnter={() => setHoverInfo({ type: "team", index: i, x: cx, y: cy })} onMouseLeave={() => setHoverInfo(null)} style={{ cursor: "pointer" }} />
              <circle cx={cx} cy={cy} r={isHovered ? DOT_RADIUS + 3 : DOT_RADIUS + 1} fill={color} stroke="var(--ak-warm-50)" strokeWidth={2.5} style={{ pointerEvents: "none", transition: "r 150ms ease" }} />
              <text x={cx} y={cy - DOT_RADIUS - 8} textAnchor="middle" fontSize={11} fill={color} fontWeight={600} style={{ pointerEvents: "none" }}>{team.name}</text>
            </g>
          );
        })}
      </>
    );
  }

  function renderZoom3() {
    return (
      <>
        {individuals.map((person, i) => {
          const cx = xScale(person.index_chci);
          const cy = yScale(person.index_umim);
          const color = getPersonColor(person);
          const isHovered = hoverInfo?.type === "person" && hoverInfo.index === i;
          return (
            <g key={person.jmeno}>
              <circle cx={cx} cy={cy} r={HOVER_RADIUS} fill="transparent" onMouseEnter={() => setHoverInfo({ type: "person", index: i, x: cx, y: cy })} onMouseLeave={() => setHoverInfo(null)} style={{ cursor: "pointer" }} />
              <circle cx={cx} cy={cy} r={isHovered ? DOT_RADIUS + 2 : DOT_RADIUS} fill={color} stroke="var(--ak-warm-50)" strokeWidth={2} style={{ pointerEvents: "none", transition: "opacity 400ms ease" }} />
            </g>
          );
        })}
      </>
    );
  }

  function renderTooltipContent() {
    if (!displayInfo) return null;
    if (displayInfo.type === "benchmark") {
      return (
        <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
          <p className="font-semibold">Benchmark trhu</p>
          <div className="mt-1 space-y-0.5">
            <p>Umím: <strong>{benchmarkUmim.toFixed(1)}</strong></p>
            <p>Chci: <strong>{benchmarkChci.toFixed(1)}</strong></p>
          </div>
        </div>
      );
    }
    if (activeTab === "team" && displayInfo.type === "team") {
      return (
        <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
          <p className="font-semibold">{teamName}</p>
          <div className="mt-1 space-y-0.5">
            <p>Umím: <strong>{teamUmim.toFixed(1)}</strong></p>
            <p>Chci: <strong>{teamChci.toFixed(1)}</strong></p>
          </div>
        </div>
      );
    }
    if (activeTab === "teams" && displayInfo.type === "team" && teams) {
      const team = teams[displayInfo.index];
      if (!team) return null;
      return (
        <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
          <p className="font-semibold">{team.name}</p>
          <p className="text-fd-muted-foreground text-xs">{team.pocetLidi} lidí</p>
          <div className="mt-1 space-y-0.5">
            <p>Umím: <strong>{team.indexUmim.toFixed(1)}</strong></p>
            <p>Chci: <strong>{team.indexChci.toFixed(1)}</strong></p>
          </div>
        </div>
      );
    }
    if (activeTab === "people" && displayInfo.type === "person") {
      const person = individuals[displayInfo.index];
      if (!person) return null;
      return (
        <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md whitespace-nowrap">
          <p className="font-semibold">{person.jmeno}</p>
          <p className="text-fd-muted-foreground text-xs">{person.kategorie}</p>
          <div className="mt-1 space-y-0.5">
            <p>Umím: <strong>{person.index_umim.toFixed(2)}</strong></p>
            <p>Chci: <strong>{person.index_chci.toFixed(1)}</strong></p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full my-8 min-w-0 overflow-hidden">
      {/* Segmented control */}
      <div className="flex gap-1 p-1 rounded-lg bg-fd-muted mb-4 overflow-x-auto w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setHoverInfo(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-fd-card text-fd-foreground shadow-sm"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Graf — vždy stejná velikost */}
      <div
        ref={containerRef}
        className="h-[400px] md:h-[450px] relative"
        onMouseLeave={() => setHoverInfo(null)}
      >
        {ready && (
          <svg width={size.width} height={size.height} className="absolute inset-0">
            {renderGrid()}
            {renderBenchmarkLines()}
            {activeTab === "team" && renderZoom1()}
            {activeTab === "teams" && renderZoom2()}
            {activeTab === "people" && renderZoom3()}
          </svg>
        )}

        {/* Tooltip */}
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: displayInfo ? Math.min(displayInfo.x + DOT_RADIUS + 12, size.width - 160) : 0,
            top: displayInfo ? displayInfo.y - 30 : 0,
            opacity: hoverInfo ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          {renderTooltipContent()}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 justify-center mt-3 mb-6 text-xs text-fd-muted-foreground">
        {activeTab === "team" && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--ak-primary)" }} />
              <span>{teamName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,1 13,7 7,13 1,7" fill="var(--ak-warm-400)" stroke="var(--ak-warm-50)" strokeWidth="1.5" />
              </svg>
              <span>Benchmark trhu</span>
            </div>
          </>
        )}
        {activeTab === "teams" && teams?.map((team, i) => (
          <div key={team.name} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }} />
            <span>{team.name}</span>
          </div>
        ))}
        {activeTab === "people" && (
          (customGroups ? Object.keys(customGroups) : groupNames).map((group, i) => (
            <div key={group} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customGroups ? GROUP_COLORS[group] || GROUP_COLORS.default : TEAM_COLORS[i % TEAM_COLORS.length] }} />
              <span>{group}</span>
            </div>
          ))
        )}
        {(activeTab === "teams" || activeTab === "people") && (
          <div className="flex items-center gap-1.5">
            <div className="w-6 border-t-2 border-dashed" style={{ borderColor: "var(--ak-warm-400)" }} />
            <span>Benchmark trhu</span>
          </div>
        )}
      </div>

      {/* Dlaždice — vždy viditelné */}
      <MetricCards data={metrics} />
    </div>
  );
}
