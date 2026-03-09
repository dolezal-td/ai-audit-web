"use client";

import { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Recharts uses SVG attributes, not CSS styles — CSS variables
// don't resolve in SVG attributes. Use hex values directly.
const COLORS = {
  primary: "#1C60FF",
  primaryFill: "rgba(28, 96, 255, 0.25)",
  company: "#ef4444",
  companyFill: "rgba(239, 68, 68, 0.06)",
  benchmark: "#4A3D30",
  benchmarkDark: "#e8dcc8",
  benchmarkFill: "rgba(74, 61, 48, 0.06)",
  grid: "#F5E0C8",
  gridDark: "#3a3228",
  text: "#8A7560",
};

interface TeamRadarDataPoint {
  metric: string;
  value: number;
  benchmark: number;
  companyBenchmark?: number;
}

interface TeamRadarProps {
  data: TeamRadarDataPoint[];
  clientName?: string;
  companyName?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value.toFixed(1)}</strong> / 10
        </p>
      ))}
    </div>
  );
}

export function TeamRadar({ data, clientName = "Firma", companyName }: TeamRadarProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const hasCompanyBenchmark = data.some((d) => d.companyBenchmark != null);

  const chartData = data.map((d) => ({
    metric: d.metric,
    firma: d.value,
    ...(d.companyBenchmark != null && { firmacelkem: d.companyBenchmark }),
    benchmark: d.benchmark,
  }));

  if (!mounted) {
    return (
      <div className="w-full my-8 h-[420px] md:h-[500px] rounded-xl border bg-fd-card animate-pulse" />
    );
  }

  const gridColor = isDark ? COLORS.gridDark : COLORS.grid;
  const textColor = isDark ? "#d1d5db" : "#374151";

  return (
    <div className="w-full my-8">
      <div className="h-[420px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: textColor, fontSize: 14, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[0, 10]}
              tickCount={6}
              angle={90}
              tick={{ fill: COLORS.text, fontSize: 10, opacity: 0.6 }}
              axisLine={false}
            />
            <Radar
              name="Benchmark trhu"
              dataKey="benchmark"
              stroke={isDark ? COLORS.benchmarkDark : COLORS.benchmark}
              fill={isDark ? COLORS.benchmarkDark : COLORS.benchmark}
              fillOpacity={0.06}
              strokeWidth={1.5}
            />
            {hasCompanyBenchmark && (
              <Radar
                name={companyName ?? "Celá firma"}
                dataKey="firmacelkem"
                stroke={COLORS.company}
                fill={COLORS.company}
                fillOpacity={0.06}
                strokeWidth={1.5}
              />
            )}
            <Radar
              name={clientName}
              dataKey="firma"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
