import { RootProvider } from 'fumadocs-ui/provider/next';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AI Kompas',
  description: 'AI audit report',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className}`}>
        <RootProvider
          search={{ enabled: false }}
          i18n={{
            locale: 'cs',
            translations: {
              toc: 'Na této stránce',
              search: 'Hledat',
              searchNoResult: 'Nic nenalezeno',
              tocNoHeadings: 'Žádné nadpisy',
              lastUpdate: 'Naposledy aktualizováno',
              nextPage: 'Další stránka',
              previousPage: 'Předchozí stránka',
              chooseTheme: 'Vzhled',
            },
          }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
