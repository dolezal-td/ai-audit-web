import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
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
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
