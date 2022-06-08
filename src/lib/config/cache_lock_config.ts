import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

export const cacheLockConfigFactory = composeConfig({
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

export type TPRInfoConfig = ReturnType<typeof cacheLockConfigFactory.load>;
