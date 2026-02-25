"use client";

import { HeatmapTable } from "./heatmap-table";

interface ToolData {
  nazev: string;
  pouzivam: number;
  znam: number;
  neznam: number;
}

interface ToolsHeatmapProps {
  data: ToolData[];
  totalRespondents: number;
}

export function ToolsHeatmap({ data, totalRespondents }: ToolsHeatmapProps) {
  const columns = ["Používám", "Znám", "Neznám"];
  const rows = data.map((item) => ({
    label: item.nazev,
    values: [
      item.pouzivam / totalRespondents,
      item.znam / totalRespondents,
      item.neznam / totalRespondents,
    ],
  }));

  return <HeatmapTable columns={columns} rows={rows} maxValue={1} />;
}
