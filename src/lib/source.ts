import { jtreFinance, jtreObchod } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const jtreFinanceSource = loader({
  source: jtreFinance.toFumadocsSource(),
  baseUrl: '/jtre-finance',
});

export const jtreObchodSource = loader({
  source: jtreObchod.toFumadocsSource(),
  baseUrl: '/jtre-obchod',
});
