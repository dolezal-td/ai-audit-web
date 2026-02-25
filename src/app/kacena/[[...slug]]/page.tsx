import { kacenaSource } from '@/lib/source';
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
import { ToolsHeatmap } from '@/components/charts/tools-heatmap';
import { MetricCards } from '@/components/ui/metric-cards';
import { Callout } from '@/components/ui/callout';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) redirect('/kacena/uvod');

  const page = kacenaSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{
          ...defaultMdxComponents,
          TeamRadar,
          ScatterPlotChart,
          HeatmapTable,
          ActivityHeatmap,
          ToolsHeatmap,
          MetricCards,
          Callout,
        }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return kacenaSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = kacenaSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: `${page.data.title} — AI Kompas`,
    description: page.data.description,
  };
}
