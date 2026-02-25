"use client";

import { HeatmapTable } from "./heatmap-table";

interface ActivityData {
  nazev: string;
  distribuce: {
    denne: number;
    tyden: number;
    mesic: number;
    mene: number;
  };
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  totalRespondents: number;
}

export function ActivityHeatmap({ data, totalRespondents }: ActivityHeatmapProps) {
  const columns = ["Denně", "Párkrát za týden", "Párkrát měsíčně", "Méně často / vůbec"];
  const rows = data.map((item) => ({
    label: item.nazev,
    values: [
      item.distribuce.denne / totalRespondents,
      item.distribuce.tyden / totalRespondents,
      item.distribuce.mesic / totalRespondents,
      item.distribuce.mene / totalRespondents,
    ],
  }));

  return <HeatmapTable columns={columns} rows={rows} maxValue={1} />;
}
