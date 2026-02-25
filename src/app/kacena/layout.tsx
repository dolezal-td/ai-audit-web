import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { kacenaSource } from '@/lib/source';
import { SidebarSeparator } from '@/components/sidebar-separator';

export default function KacenaLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={kacenaSource.pageTree}
      nav={{ title: 'AI Kompas', url: '/kacena/uvod' }}
      searchToggle={{ enabled: false }}
      sidebar={{
        banner: (
          <div className="rounded-lg border bg-fd-card p-4 text-sm">
            <p className="font-medium">Kuchyně Kačena s.r.o.</p>
            <p className="text-fd-muted-foreground">Kuchyňské provozy</p>
          </div>
        ),
        components: {
          Separator: SidebarSeparator,
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
