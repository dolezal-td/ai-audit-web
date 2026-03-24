import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const kacena = defineDocs({
  dir: 'content/kacena',
});

export const jtreFinance = defineDocs({
  dir: 'content/jtre-finance',
});

export const jtreObchod = defineDocs({
  dir: 'content/jtre-obchod',
});

export const jtreProjektoveRizeni = defineDocs({
  dir: 'content/jtre-projektove-rizeni',
});

export const euroinstitut = defineDocs({
  dir: 'content/euroinstitut',
});

export default defineConfig();
