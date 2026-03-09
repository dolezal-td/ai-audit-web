import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { jtreFinanceSource } from '@/lib/source';
import { SidebarSeparator } from '@/components/sidebar-separator';
import { ReportSwitcher } from '@/components/report-switcher';
import { NavTitle } from '@/components/nav-title';
import { decodeSession } from '@/lib/auth';

export default async function JtreFinanceLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pin-session');
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;
  const reports = session?.reports ?? [];

  return (
    <DocsLayout
      tree={jtreFinanceSource.pageTree}
      nav={{
        title: <NavTitle showHome={reports.length > 1} reportSlug="jtre-finance" />,
        url: '/jtre-finance/uvod',
      }}
      searchToggle={{ enabled: false }}
      sidebar={{
        banner: (
          <ReportSwitcher currentReport="jtre-finance" reports={reports} />
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
