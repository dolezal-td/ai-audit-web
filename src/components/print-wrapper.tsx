"use client";

import { useEffect, useState } from "react";

export function PrintWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for charts (Recharts SVG, custom SVGs) to render
    const timer = setTimeout(() => {
      setReady(true);
      window.print();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-page">
      {/* Top bar — hidden in print */}
      <div className="print-topbar">
        <span style={{ color: "var(--ak-warm-600)", fontSize: "0.9rem" }}>
          {ready ? "Připraveno k tisku" : "Připravuji report…"}
        </span>
        <button
          onClick={() => window.print()}
          className="print-btn"
          style={{
            backgroundColor: "var(--ak-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.25rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tisknout / Uložit PDF
        </button>
      </div>
      {children}
    </div>
  );
}
