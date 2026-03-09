import { ACCESS, type AccessEntry } from "@/config/access";

export interface Session {
  name: string;
  reports: string[];
}

export function findByPin(pin: string): AccessEntry | undefined {
  return ACCESS.find((a) => a.pin === pin);
}

export function encodeSession(session: Session): string {
  // encodeURIComponent handles UTF-8, btoa works in both Node.js and Edge
  return btoa(encodeURIComponent(JSON.stringify(session)));
}

export function decodeSession(cookie: string): Session | null {
  try {
    const json = decodeURIComponent(atob(cookie));
    const parsed = JSON.parse(json);
    if (parsed.reports && Array.isArray(parsed.reports)) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}
