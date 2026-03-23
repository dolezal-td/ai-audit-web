"use client";

import { useState, useRef, useEffect } from "react";

interface RoadmapStep {
  number: number;
  title: string;
  description: string;
  detail?: string;
  timing?: string;
  responsible?: string;
  parallel?: boolean;
}

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
}

function StepItem({ step, isLast }: { step: RoadmapStep; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open, step.detail, step.timing, step.responsible]);

  const hasExpandable = step.detail || step.timing || step.responsible;

  return (
    <div className="relative flex gap-4 sm:gap-6">
      {/* Timeline line + circle */}
      <div className="flex flex-col items-center shrink-0">
        <button
          type="button"
          onClick={() => hasExpandable && setOpen(!open)}
          className={`
            relative z-10 flex items-center justify-center
            w-11 h-11 sm:w-13 sm:h-13 rounded-full
            text-lg sm:text-xl font-bold
            border-2 transition-all duration-200
            ${hasExpandable ? "cursor-pointer" : "cursor-default"}
            ${
              open
                ? "border-[var(--ak-primary)] bg-[var(--ak-primary)] text-white shadow-md"
                : step.parallel
                  ? "border-[var(--ak-primary-light)] bg-[var(--ak-primary-fill)] text-[var(--ak-primary)]"
                  : "border-[var(--ak-primary)] bg-fd-card text-[var(--ak-primary)]"
            }
          `}
          aria-expanded={hasExpandable ? open : undefined}
        >
          {step.number}
        </button>
        {!isLast && (
          <div
            className="w-0.5 grow min-h-6"
            style={{ backgroundColor: "var(--ak-primary-light)" }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isLast ? "pb-0" : ""} min-w-0 flex-1`}>
        <div
          className={`flex flex-col gap-1 ${hasExpandable ? "cursor-pointer" : ""}`}
          onClick={() => hasExpandable && setOpen(!open)}
          onKeyDown={(e) => {
            if (hasExpandable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setOpen(!open);
            }
          }}
          role={hasExpandable ? "button" : undefined}
          tabIndex={hasExpandable ? 0 : undefined}
        >
          <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-2.5">
            <h3 className="text-base sm:text-lg font-semibold text-fd-foreground leading-tight m-0">
              {step.title}
            </h3>
            {step.parallel && (
              <span
                className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--ak-primary-fill)",
                  color: "var(--ak-primary)",
                  border: "1px solid var(--ak-primary-light)",
                }}
              >
                Paralelně s krokem {step.number - 1}
              </span>
            )}
            {hasExpandable && (
              <svg
                className={`w-4 h-4 text-fd-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
          <p className="text-sm sm:text-base text-fd-muted-foreground leading-relaxed m-0">
            {step.description}
          </p>
        </div>

        {/* Expandable detail */}
        {hasExpandable && (
          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: open ? `${height}px` : "0px" }}
          >
            <div ref={contentRef} className="pt-3 flex flex-col gap-2">
              {step.detail && (
                <div
                  className="rounded-lg border p-4 text-sm sm:text-base leading-relaxed"
                  style={{
                    backgroundColor: "var(--ak-primary-fill)",
                    borderColor: "var(--ak-primary-light)",
                  }}
                >
                  {step.detail}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {step.timing && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-fd-muted-foreground">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {step.timing}
                  </span>
                )}
                {step.responsible && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-fd-muted-foreground">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {step.responsible}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoadmapTimeline({ steps }: RoadmapTimelineProps) {
  return (
    <div className="my-8 not-prose">
      {steps.map((step, i) => (
        <StepItem key={step.number} step={step} isLast={i === steps.length - 1} />
      ))}
    </div>
  );
}
