import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { jtreFinanceSource } from '@/lib/source';

export default function JtreFinanceLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={jtreFinanceSource.pageTree}
      nav={{ title: 'AI Kompas — J&T RE / Finance' }}
      sidebar={{
        banner: (
          <div className="rounded-lg border bg-fd-card p-4 text-sm">
            <p className="font-medium">J&T Real Estate</p>
            <p className="text-fd-muted-foreground">Finanční oddělení — AI Kompas</p>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
