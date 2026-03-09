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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold tracking-tight mb-3"
            style={{
              fontFamily: "var(--font-display), 'Inter', sans-serif",
              color: "var(--ak-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            AI Kompas
          </h1>
          <p
            className="text-lg"
            style={{ color: "var(--ak-warm-600)" }}
          >
            Vyberte report
          </p>
        </div>

        {/* Report cards */}
        <div className="grid gap-5">
          {availableReports.map((slug) => {
            const report = REPORTS[slug];
            return (
              <Link
                key={slug}
                href={`/${slug}/uvod`}
                className="group relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-200 hover:scale-[1.015] hover:shadow-2xl"
                style={{
                  backgroundColor: "var(--color-fd-card)",
                  borderColor: "var(--ak-warm-300)",
                }}
              >
                {/* Decorative accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-200 group-hover:w-2"
                  style={{ backgroundColor: "var(--ak-primary)" }}
                />

                <div className="flex items-center justify-between">
                  <div className="pl-4">
                    <p
                      className="text-2xl font-bold tracking-tight mb-1"
                      style={{
                        fontFamily: "var(--font-display), 'Inter', sans-serif",
                        color: "var(--ak-warm-900)",
                      }}
                    >
                      {report.title}
                    </p>
                    <p
                      className="text-base"
                      style={{ color: "var(--ak-warm-600)" }}
                    >
                      {report.subtitle}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group-hover:translate-x-1"
                    style={{ backgroundColor: "var(--ak-primary-fill)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      style={{ color: "var(--ak-primary)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-12"
          style={{ color: "var(--ak-warm-500)" }}
        >
          AI Pro Smrtelníky
        </p>
      </div>
    </div>
  );
}
