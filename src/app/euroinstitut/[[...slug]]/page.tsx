import { euroinstitutSource } from '@/lib/source';
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
import { InfoModal } from '@/components/ui/info-modal';
import { EducationProgress } from '@/components/charts/education-progress';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) redirect('/euroinstitut/uvod');

  const page = euroinstitutSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const isUvod = params.slug?.[0] === 'uvod';

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {!isUvod && <DocsTitle>{page.data.title}</DocsTitle>}
      {!isUvod && <DocsDescription>{page.data.description}</DocsDescription>}
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
          InfoModal,
          EducationProgress,
        }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return euroinstitutSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = euroinstitutSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: `${page.data.title} — AI Kompas`,
    description: page.data.description,
  };
}
