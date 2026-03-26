"use client";

import { useEffect, useState } from "react";
import { Tooltip } from "radix-ui";
import { Check, Clock, Info } from "lucide-react";

interface PersonProgress {
  jmeno: string;
  oddeleni: string;
  inspirace: number;
  audit_dotaznik: number;
  audit_rozhovor: number;
  nalejvarna: number;
  nalejvarna_plan: number;
  hackathon: number;
  hackathon_plan: number;
  workshop: number;
  workshop_plan: number;
}

interface EducationProgressProps {
  data: PersonProgress[];
}

// Cell states
type CellStatus = "none" | "partial" | "done" | "planned" | "multi";

function getCellStatus(done: number, planned: number): CellStatus {
  if (done >= 2) return "multi";
  if (done === 1) return "done";
  if (planned > 0) return "planned";
  return "none";
}

function getCountStatus(count: number): CellStatus {
  if (count >= 2) return "multi";
  if (count === 1) return "done";
  return "none";
}

function StatusCell({
  status,
  count,
  label,
  person,
  isDark,
}: {
  status: CellStatus;
  count?: number;
  label: string;
  person: string;
  isDark: boolean;
}) {
  const styles: Record<CellStatus, { bg: string; fg: string; text: string }> = {
    none: {
      bg: isDark ? "hsl(0, 0%, 14%)" : "hsl(0, 0%, 96%)",
      fg: isDark ? "hsl(0, 0%, 35%)" : "hsl(0, 0%, 70%)",
      text: "",
    },
    planned: {
      bg: isDark ? "hsl(220, 20%, 20%)" : "hsl(220, 40%, 93%)",
      fg: isDark ? "hsl(220, 30%, 60%)" : "hsl(220, 40%, 55%)",
      text: "?",
    },
    partial: {
      bg: isDark ? "hsl(200, 50%, 22%)" : "hsl(200, 70%, 88%)",
      fg: isDark ? "hsl(200, 60%, 70%)" : "hsl(200, 60%, 35%)",
      text: "",
    },
    done: {
      bg: isDark ? "hsl(142, 50%, 20%)" : "hsl(142, 60%, 85%)",
      fg: isDark ? "hsl(142, 60%, 70%)" : "hsl(142, 50%, 30%)",
      text: "",
    },
    multi: {
      bg: isDark ? "hsl(142, 60%, 25%)" : "hsl(142, 65%, 75%)",
      fg: isDark ? "#ffffff" : "hsl(142, 50%, 20%)",
      text: "",
    },
  };

  const s = styles[status];
  const displayText = status === "multi" && count ? `${count}×` : status === "planned" ? "?" : s.text;

  const tooltipText =
    status === "none"
      ? `${person}: ${label} – zatím ne`
      : status === "planned"
        ? `${person}: ${label} – plánováno`
        : status === "partial"
          ? `${person}: ${label} – částečně`
          : status === "multi" && count
            ? `${person}: ${label} – ${count}× absolvováno`
            : `${person}: ${label} – absolvováno`;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <td
          className="py-2 px-1.5 text-center text-xs font-medium select-none"
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          {status === "done" ? (
            <Check size={14} strokeWidth={2.5} className="mx-auto" />
          ) : status === "none" ? (
            <span className="opacity-30">–</span>
          ) : (
            displayText
          )}
        </td>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-xs rounded-lg border px-3 py-2 text-sm shadow-md"
          style={{
            backgroundColor: "var(--ak-tooltip-bg)",
            borderColor: "var(--ak-tooltip-border)",
          }}
          sideOffset={5}
        >
          {tooltipText}
          <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Summary row
function SummaryRow({
  data,
  isDark,
}: {
  data: PersonProgress[];
  isDark: boolean;
}) {
  const total = data.length;
  const counts = {
    inspirace: data.filter((p) => p.inspirace > 0).length,
    dotaznik: data.filter((p) => p.audit_dotaznik > 0).length,
    rozhovor: data.filter((p) => p.audit_rozhovor > 0).length,
    nalejvarna: data.filter((p) => p.nalejvarna > 0).length,
    hackathon: data.filter((p) => p.hackathon > 0).length,
    workshop: data.filter((p) => p.workshop > 0).length,
  };

  const cellStyle = {
    backgroundColor: isDark ? "hsl(0, 0%, 16%)" : "hsl(0, 0%, 94%)",
  };

  return (
    <tr className="border-t-2 border-fd-border">
      <td
        className="sticky left-0 z-10 py-2.5 px-3 font-bold text-sm border-r border-fd-border"
        style={cellStyle}
      >
        Celkem
      </td>
      {Object.values(counts).map((c, i) => (
        <td
          key={i}
          className="py-2.5 px-1.5 text-center text-xs font-bold"
          style={cellStyle}
        >
          {c}/{total}
        </td>
      ))}
    </tr>
  );
}

const COLUMNS = [
  { key: "inspirace", label: "Inspirace", desc: "Exkurze do světa AI – úvodní webinář" },
  { key: "dotaznik", label: "Dotazník", desc: "Vyplněný AI audit dotazník" },
  { key: "rozhovor", label: "Rozhovor", desc: "Hloubkový rozhovor v rámci auditu" },
  { key: "nalejvarna", label: "Nalejvárna", desc: "Celodenní praktický bootcamp" },
  { key: "hackathon", label: "Hackathon", desc: "Týmová práce na reálném projektu" },
  { key: "workshop", label: "Workshop", desc: "Specializovaný workshop na konkrétní projekt" },
];

export function EducationProgress({ data }: EducationProgressProps) {
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

  if (!mounted) {
    return <div className="w-full h-64 animate-pulse bg-fd-muted" />;
  }

  // Group by department
  let currentDept = "";

  return (
    <Tooltip.Provider delayDuration={200}>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-fd-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-4 rounded"
            style={{
              backgroundColor: isDark ? "hsl(142, 50%, 20%)" : "hsl(142, 60%, 85%)",
            }}
          />
          Absolvováno
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-4 rounded"
            style={{
              backgroundColor: isDark ? "hsl(142, 60%, 25%)" : "hsl(142, 65%, 75%)",
            }}
          />
          Víckrát
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-4 rounded"
            style={{
              backgroundColor: isDark ? "hsl(200, 50%, 22%)" : "hsl(200, 70%, 88%)",
            }}
          />
          Částečně
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-4 rounded"
            style={{
              backgroundColor: isDark ? "hsl(220, 20%, 20%)" : "hsl(220, 40%, 93%)",
            }}
          />
          Plánováno
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr className="bg-fd-muted/50">
              <th className="sticky left-0 z-10 bg-fd-muted/50 text-left py-2.5 px-3 font-medium text-fd-muted-foreground w-[160px] min-w-[160px]">
                Jméno
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="py-2.5 px-1.5 font-medium text-fd-muted-foreground text-center min-w-[70px] whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-0.5 text-xs">
                    {col.label}
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          className="inline-flex text-fd-muted-foreground/50 hover:text-fd-muted-foreground transition-colors"
                          tabIndex={-1}
                        >
                          <Info size={11} strokeWidth={2} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="z-50 max-w-[220px] rounded-lg border px-3 py-2 text-xs font-normal text-left shadow-md"
                          style={{
                            backgroundColor: "var(--ak-tooltip-bg)",
                            borderColor: "var(--ak-tooltip-border)",
                          }}
                          sideOffset={5}
                        >
                          {col.desc}
                          <Tooltip.Arrow style={{ fill: "var(--ak-tooltip-border)" }} />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((person) => {
              const showDeptHeader = person.oddeleni !== currentDept && person.oddeleni;
              if (person.oddeleni) currentDept = person.oddeleni;

              return (
                <>
                  {showDeptHeader && (
                    <tr key={`dept-${person.oddeleni}`}>
                      <td
                        colSpan={7}
                        className="py-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground bg-fd-muted/30 border-t border-fd-border"
                      >
                        {person.oddeleni}
                      </td>
                    </tr>
                  )}
                  <tr
                    key={person.jmeno}
                    className="border-t border-fd-border hover:bg-fd-muted/20 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-fd-background py-2 px-3 font-medium text-sm border-r border-fd-border">
                      {person.jmeno}
                    </td>
                    <StatusCell
                      status={getCellStatus(person.inspirace, 0)}
                      count={person.inspirace}
                      label="Inspirace"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                    <StatusCell
                      status={getCountStatus(person.audit_dotaznik)}
                      count={person.audit_dotaznik}
                      label="Dotazník"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                    <StatusCell
                      status={getCountStatus(person.audit_rozhovor)}
                      count={person.audit_rozhovor}
                      label="Rozhovor"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                    <StatusCell
                      status={getCellStatus(person.nalejvarna, person.nalejvarna_plan)}
                      count={person.nalejvarna}
                      label="Nalejvárna"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                    <StatusCell
                      status={getCellStatus(person.hackathon, person.hackathon_plan)}
                      count={person.hackathon}
                      label="Hackathon"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                    <StatusCell
                      status={getCellStatus(person.workshop, person.workshop_plan)}
                      count={person.workshop}
                      label="Workshop"
                      person={person.jmeno}
                      isDark={isDark}
                    />
                  </tr>
                </>
              );
            })}
          </tbody>

          <tfoot>
            <SummaryRow data={data} isDark={isDark} />
          </tfoot>
        </table>
      </div>
    </Tooltip.Provider>
  );
}
