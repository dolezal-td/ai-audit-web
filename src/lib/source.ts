import { kacena, jtreFinance } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const kacenaSource = loader({
  source: kacena.toFumadocsSource(),
  baseUrl: '/kacena',
});

export const jtreFinanceSource = loader({
  source: jtreFinance.toFumadocsSource(),
  baseUrl: '/jtre-finance',
});
