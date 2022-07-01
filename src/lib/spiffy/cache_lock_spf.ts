import * as t from '@withgraphite/retype';
import { spiffy } from './spiffy';

export const cacheLockConfigFactory = spiffy({
  schema: t.shape({
    timestamp: t.optional(t.number),
    pid: t.optional(t.number),
  }),
  defaultLocations: [
    {
      relativePath: '.graphite_cache_lock',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return {
      timestamp: undefined,
      pid: undefined,
    };
  },
  helperFunctions: () => {
    return {};
  },
  options: { removeIfEmpty: true },
});
