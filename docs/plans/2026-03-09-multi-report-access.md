# Multi-Report Access Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** PIN-based auth s per-person přístupy k více reportům, homepage pro výběr reportů, přepínač v sidebaru.

**Architecture:** Jeden config soubor (`access.ts`) definuje osoby, PINy a přístupy. Session cookie obsahuje base64-encoded JSON se seznamem reportů. Middleware ověřuje přístup per-route. Homepage se zobrazuje jen pro 2+ reportů, jinak redirect rovnou na report.

**Tech Stack:** Next.js 16 (App Router), Fumadocs UI, Tailwind CSS 4

---

### Task 1: Config + Auth helpers

**Files:**
- Create: `src/config/access.ts`
- Create: `src/lib/auth.ts`

**Step 1: Vytvořit access config**

```ts
// src/config/access.ts

export interface AccessEntry {
  pin: string;
  name: string;
  reports: string[];
}

export const ACCESS: AccessEntry[] = [
  {
    pin: "876200",
    name: "František Jíša",
    reports: ["jtre-finance", "jtre-obchod"],
  },
  {
    pin: "341500",
    name: "Leonie Holíková",
    reports: ["jtre-finance"],
  },
];

export const REPORTS: Record<string, { title: string; subtitle: string }> = {
  "jtre-finance": { title: "J&T Real Estate", subtitle: "Finanční oddělení" },
  "jtre-obchod": { title: "J&T Real Estate", subtitle: "Obchodní oddělení" },
};

// Odvozený seznam všech chráněných reportů
export const PROTECTED_REPORTS = [...new Set(ACCESS.flatMap((a) => a.reports))];
```

**Step 2: Vytvořit auth helpers**

```ts
// src/lib/auth.ts
import { ACCESS, type AccessEntry } from "@/config/access";

export interface Session {
  name: string;
  reports: string[];
}

export function findByPin(pin: string): AccessEntry | undefined {
  return ACCESS.find((a) => a.pin === pin);
}

export function encodeSession(session: Session): string {
  return btoa(JSON.stringify(session));
}

export function decodeSession(cookie: string): Session | null {
  try {
    const parsed = JSON.parse(atob(cookie));
    if (parsed.reports && Array.isArray(parsed.reports)) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}
```

**Step 3: Commit**

```bash
git add src/config/access.ts src/lib/auth.ts
git commit -m "feat: access config a auth helpers"
```

---

### Task 2: API route — přepracovat verify endpoint

**Files:**
- Modify: `src/app/api/auth/verify/route.ts`

**Step 1: Přepsat API route**

Nahradit celý soubor:

```ts
// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findByPin, encodeSession } from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to za 15 minut." },
      { status: 429 },
    );
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 });
  }

  const { pin } = body;

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Zadejte 6místný PIN" },
      { status: 400 },
    );
  }

  const entry = findByPin(pin);
  if (!entry) {
    return NextResponse.json(
      { error: `Nesprávný PIN. Zbývá ${rateLimit.remaining} pokusů.` },
      { status: 401 },
    );
  }

  // Úspěch — vyčistit rate limit a nastavit session cookie
  attempts.delete(ip);

  const session = encodeSession({ name: entry.name, reports: entry.reports });
  const response = NextResponse.json({
    ok: true,
    name: entry.name,
    reports: entry.reports,
  });

  response.cookies.set("pin-session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
```

**Step 2: Commit**

```bash
git add src/app/api/auth/verify/route.ts
git commit -m "feat: verify endpoint — PIN per osoba, session cookie"
```

---

### Task 3: Middleware — session cookie + odvozené chráněné reporty

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Přepsat middleware**

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_REPORTS } from "@/config/access";
import { decodeSession } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth page, API routes, static files
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Zjistit jestli cesta patří chráněnému reportu
  const report = PROTECTED_REPORTS.find(
    (r) => pathname.startsWith(`/${r}/`) || pathname === `/${r}`,
  );

  // Homepage (/) — taky potřebuje session
  const isHomepage = pathname === "/";

  if (!report && !isHomepage) return NextResponse.next();

  // Přečíst session cookie
  const sessionCookie = request.cookies.get("pin-session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    if (!isHomepage) url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Homepage — pustit dál (stránka si řeší redirect sama)
  if (isHomepage) return NextResponse.next();

  // Kontrola přístupu ke konkrétnímu reportu
  if (report && !session.reports.includes(report)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|auth).*)",
  ],
};
```

**Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: middleware — session cookie, multi-report přístup"
```

---

### Task 4: Univerzální PIN stránka

**Files:**
- Create: `src/app/auth/page.tsx`
- Delete: `src/app/auth/[client]/page.tsx`

**Step 1: Vytvořit univerzální PIN stránku**

Přesunout obsah z `auth/[client]/page.tsx` do `auth/page.tsx`. Klíčové změny:
- Odebrat `params.client` — PIN stránka je univerzální
- Po úspěšném přihlášení:
  - API vrátí `reports[]`
  - Pokud `from` searchparam existuje → redirect tam
  - Pokud 1 report → redirect na `/${reports[0]}/uvod`
  - Pokud 2+ reportů → redirect na `/`
- Submit posílá jen `{ pin }` (ne `{ client, pin }`)

**Step 2: Smazat `src/app/auth/[client]/page.tsx`**

**Step 3: Commit**

```bash
git add src/app/auth/page.tsx
git rm src/app/auth/\[client\]/page.tsx
git commit -m "feat: univerzální PIN stránka"
```

---

### Task 5: Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Homepage s kartami reportů**

```tsx
// src/app/page.tsx
// Server component, čte cookie a zobrazuje karty dostupných reportů
// Pokud 1 report → redirect na report
// Pokud 0 reportů (nemá cookie) → middleware přesměruje na /auth
// Pokud 2+ → karty ve stylu PIN stránky (gradient, Playfair)
```

Homepage čte `pin-session` cookie (server-side přes `cookies()` z `next/headers`), dekóduje session, zobrazí karty z `REPORTS` configu.

Vizuál: stejný gradient pozadí jako PIN stránka, nadpis "AI Kompas", pod ním karty s title + subtitle, hover efekt.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: homepage s kartami reportů"
```

---

### Task 6: Sidebar přepínač reportů

**Files:**
- Create: `src/components/report-switcher.tsx`
- Modify: `src/app/jtre-finance/layout.tsx`

**Step 1: Vytvořit ReportSwitcher komponentu**

Client component (`"use client"`):
- Čte `pin-session` cookie (přes `document.cookie` — cookie NENÍ httpOnly pro tuto část... )

POZOR: Cookie je httpOnly — nelze číst z klienta. Řešení:
- Přidat API endpoint `GET /api/auth/session` který vrátí `{ name, reports }` z cookie
- NEBO: přidat druhý, non-httpOnly cookie `pin-reports` s jen seznamem reportů (bez bezpečnostního rizika — reporty nejsou secret)
- NEBO: předat reports jako prop z server component layoutu

Nejčistší: **server component layout čte cookie a předá reports jako prop** do client component přepínače.

Přepínač:
- Zobrazí aktuální report (title + subtitle) z `REPORTS` configu
- Trojúhelníček ▾ vpravo pokud 2+ reportů
- Klik → dropdown s ostatními reporty
- Pokud 1 report → statický box (bez trojúhelníčku, jako teď)

**Step 2: Home button vedle "AI Kompas"**

V layout.tsx změnit `nav` prop:
```tsx
nav={{
  title: <NavTitle reports={reports} />,
  url: reports.length > 1 ? '/' : `/${currentReport}/uvod`,
}}
```

`NavTitle` — client component: text "AI Kompas" + malá house ikonka (jen pro 2+ reportů).

**Step 3: Commit**

```bash
git add src/components/report-switcher.tsx src/app/jtre-finance/layout.tsx
git commit -m "feat: sidebar přepínač reportů + home button"
```

---

### Task 7: Cleanup + ověření

**Step 1: Smazat staré per-client env vars**

Vyčistit `.env.local` a `.env.example` — odebrat `AUTH_PIN_*` proměnné (PINy jsou teď v `access.ts`).

**Step 2: Ověřit build**

```bash
cd ~/Developer/ai-audit/web && npm run build
```

**Step 3: Manuální test**

- `localhost:3000` → redirect na `/auth`
- Zadat PIN 876200 → homepage se 2 kartami
- Zadat PIN 341500 → redirect rovnou na `/jtre-finance/uvod`
- Přepínač v sidebaru funguje
- Home ikonka viditelná jen pro multi-report přístup

**Step 4: Commit**

```bash
git add .
git commit -m "chore: cleanup env vars, ověření buildu"
```
