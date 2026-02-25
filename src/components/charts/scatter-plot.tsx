"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  Manažer: "#ef4444",
  Obchod: "#22c55e",
  Exekutiva: "#3b82f6",
  Marketing: "#a855f7",
  IT: "#06b6d4",
  HR: "#f97316",
  default: "#6b7280",
};

interface PersonData {
  jmeno: string;
  kategorie: string;
  index_umim: number;
  index_chci: number;
}

interface ScatterPlotProps {
  data: PersonData[];
  teamAvgUmim?: number;
  teamAvgChci?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PersonData }>;
}) {
  if (!active || !payload?.[0]) return null;
  const person = payload[0].payload;

  return (
    <div className="rounded-lg border bg-fd-card px-3 py-2 text-sm shadow-md">
      <p className="font-semibold">{person.jmeno}</p>
      <p className="text-fd-muted-foreground text-xs">{person.kategorie}</p>
      <div className="mt-1 space-y-0.5">
        <p>
          Umím: <strong>{person.index_umim.toFixed(2)}</strong>
        </p>
        <p>
          Chci: <strong>{person.index_chci.toFixed(1)}</strong>
        </p>
      </div>
    </div>
  );
}

export function ScatterPlotChart({
  data,
  teamAvgUmim,
  teamAvgChci,
}: ScatterPlotProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full my-8 h-[400px] md:h-[450px] rounded-xl border bg-fd-card animate-pulse" />
    );
  }

  const categories = [...new Set(data.map((d) => d.kategorie))];

  return (
    <div className="w-full my-8">
      <div className="h-[400px] md:h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
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
                style: { fontSize: 13, fill: "#6b7280" },
              }}
              tick={{ fontSize: 12, fill: "#6b7280" }}
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
                style: { fontSize: 13, fill: "#6b7280" },
              }}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            {teamAvgUmim && (
              <ReferenceLine
                y={teamAvgUmim}
                stroke="#9ca3af"
                strokeDasharray="6 3"
                label={{
                  value: `Ø Umím ${teamAvgUmim.toFixed(1)}`,
                  position: "right",
                  style: { fontSize: 11, fill: "#9ca3af" },
                }}
              />
            )}
            {teamAvgChci && (
              <ReferenceLine
                x={teamAvgChci}
                stroke="#9ca3af"
                strokeDasharray="6 3"
                label={{
                  value: `Ø Chci ${teamAvgChci.toFixed(1)}`,
                  position: "top",
                  style: { fontSize: 11, fill: "#9ca3af" },
                }}
              />
            )}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter data={data} fill="#3b82f6">
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    CATEGORY_COLORS[entry.kategorie] || CATEGORY_COLORS.default
                  }
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[cat] || CATEGORY_COLORS.default,
              }}
            />
            <span className="text-fd-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
