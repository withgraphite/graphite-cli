import * as t from '@withgraphite/retype';
import { spiffy } from './spiffy';

export const cachePersistenceFactory = spiffy({
  schema: t.array(t.string),
  defaultLocations: [
    {
      relativePath: '.graphite_cache_persist',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return [];
  },
  helperFunctions: () => {
    return {};
  },
  options: { removeIfEmpty: true },
});
