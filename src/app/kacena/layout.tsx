import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { kacenaSource } from '@/lib/source';

export default function KacenaLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={kacenaSource.pageTree}
      nav={{ title: 'AI Kompas — Kuchyně Kačena' }}
      sidebar={{
        banner: (
          <div className="rounded-lg border bg-fd-card p-4 text-sm">
            <p className="font-medium">Kuchyně Kačena s.r.o.</p>
            <p className="text-fd-muted-foreground">AI Kompas Report</p>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
