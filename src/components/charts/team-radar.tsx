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
  primary: "#3b82f6",
  primaryFill: "rgba(59, 130, 246, 0.25)",
  benchmark: "#9ca3af",
  benchmarkFill: "rgba(156, 163, 175, 0.08)",
  grid: "#d1d5db",
  gridDark: "#4b5563",
  text: "#6b7280",
};

interface TeamRadarDataPoint {
  metric: string;
  value: number;
  benchmark: number;
}

interface TeamRadarProps {
  data: TeamRadarDataPoint[];
  clientName?: string;
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

export function TeamRadar({ data, clientName = "Firma" }: TeamRadarProps) {
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

  const chartData = data.map((d) => ({
    metric: d.metric,
    firma: d.value,
    benchmark: d.benchmark,
  }));

  if (!mounted) {
    return (
      <div className="w-full my-8 h-[380px] md:h-[420px] rounded-xl border bg-fd-card animate-pulse" />
    );
  }

  const gridColor = isDark ? COLORS.gridDark : COLORS.grid;
  const textColor = isDark ? "#d1d5db" : "#374151";

  return (
    <div className="w-full my-8">
      <div className="h-[380px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: textColor, fontSize: 14, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[0, 10]}
              tickCount={6}
              angle={90}
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={false}
            />
            <Radar
              name="Benchmark trhu"
              dataKey="benchmark"
              stroke={COLORS.benchmark}
              fill={COLORS.benchmark}
              fillOpacity={0.08}
              strokeDasharray="6 3"
              strokeWidth={2}
            />
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
