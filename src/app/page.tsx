import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { decodeSession } from "@/lib/auth";
import { REPORTS } from "@/config/access";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pin-session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session) redirect("/auth");

  if (session.reports.length === 1) {
    redirect(`/${session.reports[0]}/uvod`);
  }

  const availableReports = session.reports.filter((r) => r in REPORTS);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            AI Kompas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vyberte report
          </p>
        </div>

        <div className="grid gap-4">
          {availableReports.map((slug) => {
            const report = REPORTS[slug];
            return (
              <Link
                key={slug}
                href={`/${slug}/uvod`}
                className="group bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 p-6 transition-all duration-150 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {report.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {report.subtitle}
                </p>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          AI Pro Smrtelníky
        </p>
      </div>
    </div>
  );
}
