import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting: track attempts per IP
const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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

// PIN configuration: AUTH_PIN_[CLIENT] environment variable
function getPin(client: string): string | undefined {
  const envKey = `AUTH_PIN_${client.toUpperCase()}`;
  return process.env[envKey];
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

  let body: { client?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 });
  }

  const { client, pin } = body;

  if (!client || !pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Zadejte 6místný PIN" },
      { status: 400 },
    );
  }

  const expectedPin = getPin(client);
  if (!expectedPin) {
    return NextResponse.json(
      { error: "Neplatný klient" },
      { status: 404 },
    );
  }

  if (pin !== expectedPin) {
    return NextResponse.json(
      {
        error: `Nesprávný PIN. Zbývá ${rateLimit.remaining} pokusů.`,
      },
      { status: 401 },
    );
  }

  // Success: clear rate limit and set cookie
  attempts.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`pin-${client}`, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
