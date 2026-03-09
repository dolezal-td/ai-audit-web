export interface AccessEntry {
  pin: string;
  name: string;
  reports: string[];
}

export const ACCESS: AccessEntry[] = [
  {
    pin: "129469",
    name: "František Jíša",
    reports: ["jtre-finance", "jtre"],
  },
  {
    pin: "110668",
    name: "Leona Holíková",
    reports: ["jtre-finance"],
  },
];

export interface ReportEntry {
  title: string;
  subtitle: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const REPORTS: Record<string, ReportEntry> = {
  "jtre-finance": { title: "Finanční oddělení", subtitle: "J&T Real Estate" },
  "jtre-obchod": { title: "Obchodní oddělení", subtitle: "J&T Real Estate" },
  jtre: {
    title: "Souhrnný report",
    subtitle: "J&T Real Estate",
    disabled: true,
    disabledMessage: "Report zatím není dostupný",
  },
};

export const PROTECTED_REPORTS = [...new Set(ACCESS.flatMap((a) => a.reports))];
