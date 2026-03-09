export interface AccessEntry {
  pin: string;
  name: string;
  reports: string[];
}

export const ACCESS: AccessEntry[] = [
  {
    pin: "129469",
    name: "František Jíša",
    reports: ["jtre-finance", "jtre-obchod"],
  },
  {
    pin: "110668",
    name: "Leona Holíková",
    reports: ["jtre-finance"],
  },
];

export const REPORTS: Record<string, { title: string; subtitle: string }> = {
  "jtre-finance": { title: "J&T Real Estate", subtitle: "Finanční oddělení" },
  "jtre-obchod": { title: "J&T Real Estate", subtitle: "Obchodní oddělení" },
};

export const PROTECTED_REPORTS = [...new Set(ACCESS.flatMap((a) => a.reports))];
