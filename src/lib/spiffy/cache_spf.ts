import * as t from '@withgraphite/retype';
import { cachedMetaSchema } from '../engine/cached_meta';
import { spiffy } from './spiffy';

export const cachePersistenceFactory = spiffy({
  schema: t.shape({
    sha: (sha: unknown): sha is string => t.string(sha) && sha.length === 40,
    branches: t.array(t.tuple([t.string, cachedMetaSchema])),
  }),
  defaultLocations: [
    {
      relativePath: '.graphite_cache_persist',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return {};
  },
  helperFunctions: () => {
    return {};
  },
  options: { removeIfEmpty: true, removeIfInvalid: true },
});
