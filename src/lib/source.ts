import { jtreFinance } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const jtreFinanceSource = loader({
  source: jtreFinance.toFumadocsSource(),
  baseUrl: '/jtre-finance',
});
