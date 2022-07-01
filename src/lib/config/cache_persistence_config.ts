import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

export const cachePersistenceFactory = composeConfig({
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
