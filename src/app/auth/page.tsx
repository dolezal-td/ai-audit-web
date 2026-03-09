"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

function PinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from");

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newDigits.every((d) => d !== "")) {
      submit(newDigits.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      submit(pasted);
    }
  }

  async function submit(pin: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const data = await res.json();
        const reports: string[] = data.reports;

        if (from) {
          router.push(from);
        } else if (reports.length === 1) {
          router.push(`/${reports[0]}/uvod`);
        } else {
          router.push("/");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Nesprávný PIN");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Chyba spojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            AI Kompas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Zadejte přístupový kód k vašemu reportu
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-black/20 p-8">
          <div className="flex gap-3 justify-center mb-6">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-13 h-15 text-center text-2xl font-bold rounded-xl
                           bg-slate-50 dark:bg-slate-900/50
                           border-2 border-slate-200 dark:border-slate-600
                           focus:border-blue-500 dark:focus:border-blue-400
                           focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10
                           focus:outline-none transition-all duration-150
                           disabled:opacity-40 disabled:cursor-not-allowed
                           text-slate-900 dark:text-slate-100"
                aria-label={`Číslice ${i + 1}`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 justify-center text-sm text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/30 rounded-lg py-2 px-3">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 justify-center text-sm text-slate-500 dark:text-slate-400">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Ověřuji...
            </div>
          )}

          {!loading && !error && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              6místný kód obdržíte od autora auditu
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          AI Pro Smrtelníky
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
        </div>
      }
    >
      <PinForm />
    </Suspense>
  );
}
