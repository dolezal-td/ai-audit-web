"use client";

import { useState } from "react";

interface InfoModalProps {
  trigger: string;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({ trigger, title, children }: InfoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-fd-primary/10 px-4 py-2.5 text-sm font-semibold text-fd-primary hover:bg-fd-primary/20 active:bg-fd-primary/25 transition-colors cursor-pointer shadow-sm border border-fd-primary/20"
      >
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-fd-border bg-fd-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-fd-muted-foreground hover:text-fd-foreground text-xl leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
