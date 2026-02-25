"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

function PinForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const client = params.client as string;
  const from = searchParams.get("from") || `/${client}/uvod`;

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

    // Auto-submit when all 6 digits are filled
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
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
        body: JSON.stringify({ client, pin }),
      });

      if (res.ok) {
        router.push(from);
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
    <div className="min-h-screen flex items-center justify-center bg-fd-background">
      <div className="w-full max-w-sm mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">AI Kompas</h1>
          <p className="text-fd-muted-foreground text-sm">
            Zadejte 6místný PIN pro přístup k reportu
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-fd-card
                         focus:border-blue-500 focus:outline-none transition-colors
                         disabled:opacity-50"
              aria-label={`Číslice ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        {loading && (
          <p className="text-center text-sm text-fd-muted-foreground">
            Ověřuji...
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-fd-background">
          <p className="text-fd-muted-foreground">Načítám...</p>
        </div>
      }
    >
      <PinForm />
    </Suspense>
  );
}
