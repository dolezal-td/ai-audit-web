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
  {
    pin: "240391",
    name: "Monika Veselá",
    reports: ["jtre-obchod"],
  },
  {
    pin: "180575",
    name: "Jiří Knob",
    reports: ["jtre-obchod"],
  },
  {
    pin: "993379",
    name: "Obchodní oddělení JTRE",
    reports: ["jtre-obchod"],
  },
  {
    pin: "379577",
    name: "Tomáš Doležal",
    reports: ["jtre-finance", "jtre-obchod", "jtre-projektove-rizeni", "jtre", "euroinstitut"],
  },
];

export interface ReportEntry {
  title: string;
  subtitle: string;
  disabled?: boolean;
  disabledMessage?: string;
  color: string;
  colorLight: string;
}

export const REPORTS: Record<string, ReportEntry> = {
  "jtre-finance": {
    title: "Finanční oddělení",
    subtitle: "J&T Real Estate",
    color: "#1C60FF",
    colorLight: "rgba(28, 96, 255, 0.08)",
  },
  "jtre-obchod": {
    title: "Obchodní oddělení",
    subtitle: "J&T Real Estate",
    color: "#7C3AED",
    colorLight: "rgba(124, 58, 237, 0.08)",
  },
  "jtre-projektove-rizeni": {
    title: "Projektové řízení",
    subtitle: "J&T Real Estate",
    color: "#0891B2",
    colorLight: "rgba(8, 145, 178, 0.08)",
  },
  jtre: {
    title: "Souhrnný report",
    subtitle: "J&T Real Estate",
    disabled: true,
    disabledMessage: "Report zatím není dostupný",
    color: "#D97706",
    colorLight: "rgba(217, 119, 6, 0.08)",
  },
  euroinstitut: {
    title: "Euroinstitut",
    subtitle: "Euroinstitut",
    color: "#059669",
    colorLight: "rgba(5, 150, 105, 0.08)",
  },
};

export const PROTECTED_REPORTS = [...new Set(ACCESS.flatMap((a) => a.reports))];
