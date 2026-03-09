import { jtreFinanceSource } from '@/lib/source';
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
import { PeopleHeatmap } from '@/components/charts/people-heatmap';
import { Mermaid } from '@/components/ui/mermaid';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) redirect('/jtre-finance/uvod');

  const page = jtreFinanceSource.getPage(params.slug);
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
          PeopleHeatmap,
          Mermaid,
        }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return jtreFinanceSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = jtreFinanceSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: `${page.data.title} — AI Kompas`,
    description: page.data.description,
  };
}
