import { kacena } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const kacenaSource = loader({
  source: kacena.toFumadocsSource(),
  baseUrl: '/kacena',
});
