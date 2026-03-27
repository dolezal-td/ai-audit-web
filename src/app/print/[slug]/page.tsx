import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession } from "@/lib/auth";
import {
  jtreFinanceSource,
  jtreObchodSource,
  jtreProjektoveRizeniSource,
  euroinstitutSource,
  demoSource,
} from "@/lib/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { TeamRadar } from "@/components/charts/team-radar";
import { ScatterPlotChart } from "@/components/charts/scatter-plot";
import { HeatmapTable } from "@/components/charts/heatmap-table";
import { ActivityHeatmap } from "@/components/charts/activity-heatmap";
import { ActivityBubbleChart } from "@/components/charts/activity-bubble-chart";
import { ToolsHeatmap } from "@/components/charts/tools-heatmap";
import { MetricCards } from "@/components/ui/metric-cards";
import { Callout } from "@/components/ui/callout";
import { PeopleHeatmap } from "@/components/charts/people-heatmap";
import { Mermaid } from "@/components/ui/mermaid";
import { TeamMapChart } from "@/components/charts/team-map-chart";
import { ProcessMatrix } from "@/components/charts/process-matrix";
import { RoadmapTimeline } from "@/components/ui/roadmap-timeline";
import { InfoModal } from "@/components/ui/info-modal";
import { EducationProgress } from "@/components/charts/education-progress";
import { MdxTable, MdxTh, MdxTd } from "@/components/ui/mdx-table";
import { PrintWrapper } from "@/components/print-wrapper";
import { REPORTS } from "@/config/access";

// Map slug to Fumadocs source
const SOURCES: Record<string, ReturnType<typeof jtreFinanceSource | any>> = {
  "jtre-finance": jtreFinanceSource,
  "jtre-obchod": jtreObchodSource,
  "jtre-projektove-rizeni": jtreProjektoveRizeniSource,
  euroinstitut: euroinstitutSource,
  demo: demoSource,
};

function getSource(slug: string) {
  return SOURCES[slug] ?? null;
}

// Extract ordered page slugs from Fumadocs pageTree (built at compile time from meta.json)
function getPageSlugsFromTree(source: ReturnType<typeof getSource>): string[] {
  if (!source) return [];
  const tree = source.pageTree;
  return tree.children
    .filter((node: { type: string }) => node.type === "page")
    .map((node: { type: string; url: string }) => {
      // url is e.g. "/jtre-finance/uvod" → extract last segment
      const segments = node.url.split("/").filter(Boolean);
      return segments[segments.length - 1];
    })
    .filter(Boolean);
}

const mdxComponents = {
  ...defaultMdxComponents,
  TeamRadar,
  ScatterPlotChart,
  HeatmapTable,
  ActivityHeatmap,
  ActivityBubbleChart,
  ToolsHeatmap,
  MetricCards,
  Callout,
  PeopleHeatmap,
  Mermaid,
  TeamMapChart,
  ProcessMatrix,
  RoadmapTimeline,
  InfoModal,
  EducationProgress,
  table: MdxTable,
  th: MdxTh,
  td: MdxTd,
};

export default async function PrintPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // Auth check
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pin-session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session || !session.reports.includes(slug)) {
    redirect("/auth");
  }

  const source = getSource(slug);
  if (!source) redirect("/");
  const pageOrder = getPageSlugsFromTree(source);
  if (pageOrder.length === 0) redirect("/");

  const report = REPORTS[slug];

  // Load all pages in order
  const pages = pageOrder
    .map((pageSlug) => {
      const page = source.getPage([pageSlug]);
      return page ? { slug: pageSlug, ...page } : null;
    })
    .filter(Boolean);

  return (
    <PrintWrapper>
      {/* Report header */}
      <div className="print-header">
        <img
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="rounded-xl"
        />
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display), 'Inter', sans-serif",
              color: "var(--ak-primary)",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {report?.title ?? "AI Kompas"}
          </h1>
          {report?.subtitle && (
            <p
              style={{
                color: "var(--ak-warm-600)",
                fontSize: "1.1rem",
                margin: 0,
              }}
            >
              {report.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* All pages rendered sequentially */}
      {pages.map((page) => {
        if (!page) return null;
        const MDX = page.data.body;
        return (
          <section key={page.slug} className="print-section prose">
            <h1>{page.data.title}</h1>
            {page.data.description && (
              <p className="print-description">{page.data.description}</p>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <MDX components={mdxComponents as any} />
          </section>
        );
      })}

      {/* Footer */}
      <div className="print-footer">
        <p style={{ color: "var(--ak-warm-500)", fontSize: "0.8rem" }}>
          AI Kompas — AI Pro Smrtelníky
        </p>
      </div>
    </PrintWrapper>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const report = REPORTS[slug];
  return {
    title: `${report?.title ?? "Report"} — PDF — AI Kompas`,
  };
}
