import { jtreObchodSource } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { TeamRadar } from '@/components/charts/team-radar';
import { ScatterPlotChart } from '@/components/charts/scatter-plot';
import { HeatmapTable } from '@/components/charts/heatmap-table';
import { ActivityHeatmap } from '@/components/charts/activity-heatmap';
import { ActivityBubbleChart } from '@/components/charts/activity-bubble-chart';
import { ToolsHeatmap } from '@/components/charts/tools-heatmap';
import { MetricCards } from '@/components/ui/metric-cards';
import { Callout } from '@/components/ui/callout';
import { PeopleHeatmap } from '@/components/charts/people-heatmap';
import { Mermaid } from '@/components/ui/mermaid';
import { MdxTable, MdxTh, MdxTd } from '@/components/ui/mdx-table';
import { TeamMapChart } from '@/components/charts/team-map-chart';
import { ProcessMatrix } from '@/components/charts/process-matrix';
import { RoadmapTimeline } from '@/components/ui/roadmap-timeline';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) redirect('/jtre-obchod/uvod');

  const page = jtreObchodSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{
          ...defaultMdxComponents,
          table: MdxTable,
          th: MdxTh,
          td: MdxTd,
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
        }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return jtreObchodSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = jtreObchodSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: `${page.data.title} — AI Kompas`,
    description: page.data.description,
  };
}
