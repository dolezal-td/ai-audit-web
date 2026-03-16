import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readFile } from "fs/promises";
import { join } from "path";
import { decodeSession } from "@/lib/auth";
import { REPORTS } from "@/config/access";
import { LogoutButton } from "@/components/logout-button";

interface ReportData {
  pocet_respondentov: number;
  tym: {
    index_umim: number;
    index_chci: number;
    benchmark: {
      index_umim: { hodnota: number; rozdil: number };
      index_chci: { hodnota: number; rozdil: number };
    };
  };
}

async function loadReportData(slug: string): Promise<ReportData | null> {
  try {
    const filePath = join(process.cwd(), "content", slug, "data.json");
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function DeltaBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        backgroundColor: isPositive
          ? "rgba(34, 197, 94, 0.12)"
          : "rgba(239, 68, 68, 0.12)",
        color: isPositive ? "#16a34a" : "#dc2626",
      }}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
    </span>
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pin-session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session) redirect("/auth");

  const availableReports = session.reports.filter((r) => r in REPORTS);
  const activeReports = availableReports.filter((r) => !REPORTS[r].disabled);

  if (
    activeReports.length === 1 &&
    activeReports.length === availableReports.length
  ) {
    redirect(`/${activeReports[0]}/uvod`);
  }

  const reportDataMap = new Map<string, ReportData | null>();
  await Promise.all(
    availableReports.map(async (slug) => {
      reportDataMap.set(slug, await loadReportData(slug));
    })
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-8 sm:px-10 sm:py-12">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between mb-10 sm:mb-14">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display), 'Inter', sans-serif",
              color: "var(--ak-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            AI Kompas
          </h1>
        </div>
        <LogoutButton />
      </div>

      {/* Tiles grid */}
      <div
        className="homepage-tiles grid gap-5 w-full"
        style={{
          gridTemplateColumns: `repeat(${Math.min(availableReports.length, 4)}, 1fr)`,
        }}
      >
        {availableReports.map((slug) => {
          const report = REPORTS[slug];
          const data = reportDataMap.get(slug);
          const isDisabled = !!report.disabled;

          const tileContent = (
            <div
              className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: isDisabled
                  ? "var(--color-fd-card)"
                  : report.colorLight,
                border: `1.5px solid ${isDisabled ? "var(--ak-warm-300)" : `${report.color}30`}`,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <div className="flex flex-col flex-1 p-6 sm:p-8">
                {/* Header */}
                <div className="mb-6">
                  <p
                    className="text-sm font-medium uppercase tracking-wider mb-2"
                    style={{
                      color: isDisabled ? "var(--ak-warm-400)" : report.color,
                    }}
                  >
                    {report.subtitle}
                  </p>
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{
                      fontFamily: "var(--font-display), 'Inter', sans-serif",
                      color: isDisabled
                        ? "var(--ak-warm-400)"
                        : "var(--ak-warm-900)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {report.title}
                  </h2>
                </div>

                {/* Metrics */}
                {data && !isDisabled ? (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* People count */}
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ color: "var(--ak-warm-500)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        />
                      </svg>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--ak-warm-600)" }}
                      >
                        {data.pocet_respondentov} respondentů
                      </span>
                    </div>

                    {/* Index Umím */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: `${report.color}0D`,
                        border: `1px solid ${report.color}20`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--ak-warm-500)" }}
                        >
                          Index Umím
                        </span>
                        <DeltaBadge
                          value={data.tym.benchmark.index_umim.rozdil}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-3xl font-bold"
                          style={{
                            fontFamily:
                              "var(--font-display), 'Inter', sans-serif",
                            color: report.color,
                          }}
                        >
                          {data.tym.index_umim.toFixed(1)}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--ak-warm-500)" }}
                        >
                          / 10
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div
                        className="mt-2 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: `${report.color}15` }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(data.tym.index_umim / 10) * 100}%`,
                            backgroundColor: report.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Index Chci */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: `${report.color}0D`,
                        border: `1px solid ${report.color}20`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--ak-warm-500)" }}
                        >
                          Index Chci
                        </span>
                        <DeltaBadge
                          value={data.tym.benchmark.index_chci.rozdil}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-3xl font-bold"
                          style={{
                            fontFamily:
                              "var(--font-display), 'Inter', sans-serif",
                            color: report.color,
                          }}
                        >
                          {data.tym.index_chci.toFixed(1)}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--ak-warm-500)" }}
                        >
                          / 10
                        </span>
                      </div>
                      <div
                        className="mt-2 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: `${report.color}15` }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(data.tym.index_chci / 10) * 100}%`,
                            backgroundColor: report.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : isDisabled ? (
                  <div className="flex-1 flex items-center">
                    {report.disabledMessage && (
                      <p
                        className="text-sm italic"
                        style={{ color: "var(--ak-warm-400)" }}
                      >
                        {report.disabledMessage}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* CTA */}
                {!isDisabled && (
                  <div className="mt-6 flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: report.color }}
                    >
                      Otevřít report
                    </span>
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      style={{ color: report.color }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );

          if (isDisabled) {
            return (
              <div key={slug} className="cursor-not-allowed">
                {tileContent}
              </div>
            );
          }

          return (
            <Link
              key={slug}
              href={`/${slug}/uvod`}
              className="group transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl rounded-2xl"
            >
              {tileContent}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <p
        className="text-center text-xs mt-10"
        style={{ color: "var(--ak-warm-500)" }}
      >
        <a
          href="https://www.linkedin.com/in/dolezaltd"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--ak-warm-500)" }}
        >
          Tomáš D. Doležal – AI pro Smrtelníky
        </a>
      </p>
    </div>
  );
}
