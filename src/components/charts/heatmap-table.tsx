"use client";

interface HeatmapRow {
  label: string;
  values: number[];
}

interface HeatmapTableProps {
  columns: string[];
  rows: HeatmapRow[];
  /** Show values as percentages (multiply by 100 and add %). Default: true */
  asPercent?: boolean;
  /** Maximum value for color intensity scaling. Default: auto-detected */
  maxValue?: number;
  /** Color scheme: "blue" for standard, "green-red" for good-bad spectrum */
  colorScheme?: "blue" | "green-red";
}

function getCellStyle(
  value: number,
  maxVal: number,
  scheme: "blue" | "green-red",
): React.CSSProperties {
  if (maxVal === 0) return {};
  const intensity = Math.min(value / maxVal, 1);

  if (intensity < 0.05) {
    return {
      backgroundColor: "transparent",
      color: "var(--color-fd-muted-foreground)",
    };
  }

  if (scheme === "green-red") {
    // Higher intensity = darker/more saturated
    const alpha = 0.08 + intensity * 0.55;
    return {
      backgroundColor: `rgba(51, 65, 85, ${alpha})`,
      color: intensity > 0.5 ? "#ffffff" : "inherit",
    };
  }

  // Default blue scheme
  const alpha = 0.08 + intensity * 0.55;
  return {
    backgroundColor: `rgba(51, 65, 85, ${alpha})`,
    color: intensity > 0.5 ? "#ffffff" : "inherit",
  };
}

const PRETTY_LABELS: Record<string, string> = {
  psaní_mailů: "Psaní mailů",
  psaní_chatových_zpráv: "Psaní chatových zpráv",
  vyhodnocování_dat_excel_nebo_něco_podobného: "Vyhodnocování dat (Excel, …)",
  příprava_prezentací: "Příprava prezentací",
  dohledávání_informací_v_interních_materiálech: "Dohledávání informací v interních materiálech",
  monitoring_veřejných_zdrojů_legislativa_apod: "Monitoring veřejných zdrojů",
  "monitoring_veřejných_zdrojů_legislativa_apod.": "Monitoring veřejných zdrojů",
  analýza_souborů_smlouvy: "Analýza souborů (smlouvy, …)",
  extrakce_informací_z_dokumentů_vytěžování_faktur_analýza: "Extrakce informací z dokumentů",
  psaní_marketingových_textů: "Psaní marketingových textů",
  projektové_řízení_zadávání_úkolů: "Projektové řízení (zadávání úkolů, …)",
  online_schůzky: "Porady",
  pohovory_s_kandidáty: "Pohovory s kandidáty",
  služební_cesty: "Služební cesty",
  překlady: "Překlady",
  chatgpt: "ChatGPT",
  microsoft_copilot: "Microsoft Copilot",
  perplexity: "Perplexity",
  notebooklm: "NotebookLM",
  google_gemini: "Google Gemini",
  claude: "Claude",
  midjourney: "Midjourney",
  gamma: "Gamma",
  runway: "Runway",
  heygen: "HeyGen",
  elevenlabs: "ElevenLabs",
  relay: "Relay",
  microsoft_power_automate: "Microsoft Power Automate",
  canva: "Canva",
};

function prettify(label: string): string {
  return PRETTY_LABELS[label] || label.replace(/_/g, " ");
}

export function HeatmapTable({
  columns,
  rows,
  asPercent = true,
  maxValue,
  colorScheme = "blue",
}: HeatmapTableProps) {
  const allValues = rows.flatMap((r) => r.values);
  const maxVal = maxValue ?? Math.max(...allValues, 1);

  return (
    <div className="w-full my-8 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 font-medium text-fd-muted-foreground w-[200px]" />
            {columns.map((col) => (
              <th
                key={col}
                className="py-2 px-3 font-medium text-fd-muted-foreground text-center min-w-[100px]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-fd-border">
              <td className="py-2.5 px-3 font-medium text-sm">
                {prettify(row.label)}
              </td>
              {row.values.map((val, i) => (
                <td
                  key={i}
                  className="py-2.5 px-3 text-center font-medium text-sm rounded-sm"
                  style={getCellStyle(val, maxVal, colorScheme)}
                >
                  {asPercent
                    ? `${(val * 100).toFixed(val * 100 % 1 === 0 ? 0 : 2)}%`
                    : val.toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
