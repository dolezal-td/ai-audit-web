import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { jtreObchodSource } from '@/lib/source';
import { SidebarSeparator } from '@/components/sidebar-separator';
import { ReportSwitcher } from '@/components/report-switcher';
import { NavTitle } from '@/components/nav-title';
import { SidebarPdfLink } from '@/components/sidebar-pdf-link';
import { LogoutButton } from '@/components/logout-button';
import { SidebarThemeToggle } from '@/components/sidebar-theme-toggle';
import { decodeSession } from '@/lib/auth';

export default async function JtreObchodLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pin-session');
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;
  const reports = session?.reports ?? [];

  return (
    <DocsLayout
      tree={jtreObchodSource.pageTree}
      nav={{
        title: <NavTitle showHome={reports.length > 1} reportSlug="jtre-obchod" />,
        url: '/jtre-obchod/uvod',
      }}
      searchToggle={{ enabled: false }}
      themeSwitch={{ enabled: false }}
      sidebar={{
        banner: (
          <ReportSwitcher currentReport="jtre-obchod" reports={reports} />
        ),
        footer: (
          <div className="flex items-center gap-1">
            <SidebarPdfLink reportSlug="jtre-obchod" />
            <SidebarThemeToggle />
            <LogoutButton variant="icon" />
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
