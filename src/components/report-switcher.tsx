"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { REPORTS } from "@/config/access";

interface ReportSwitcherProps {
  currentReport: string;
  reports: string[];
}

export function ReportSwitcher({
  currentReport,
  reports,
}: ReportSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = REPORTS[currentReport];
  const hasMultiple = reports.length > 1;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!current) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasMultiple && setOpen(!open)}
        className={`w-full rounded-lg border bg-fd-card p-4 text-sm text-left transition-colors ${
          hasMultiple
            ? "cursor-pointer hover:bg-fd-accent"
            : "cursor-default"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{current.title}</p>
            {current.subtitle && <p className="text-fd-muted-foreground">{current.subtitle}</p>}
          </div>
          {hasMultiple && (
            <svg
              className={`w-4 h-4 text-fd-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-fd-popover shadow-lg">
          {reports
            .filter((r) => r !== currentReport)
            .map((slug) => {
              const report = REPORTS[slug];
              if (!report) return null;
              return (
                <Link
                  key={slug}
                  href={`/${slug}/uvod`}
                  onClick={() => setOpen(false)}
                  className="block p-4 text-sm hover:bg-fd-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <p className="font-medium">{report.title}</p>
                  {report.subtitle && <p className="text-fd-muted-foreground">{report.subtitle}</p>}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
