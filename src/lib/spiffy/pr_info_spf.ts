import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { spiffy } from './spiffy';

export const prInfoConfigFactory = spiffy({
  schema: t.shape({
    prInfoToUpsert: API_ROUTES.pullRequestInfo.response.prs,
  }),
  defaultLocations: [
    {
      relativePath: '.graphite_pr_info',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return {
      message: undefined,
    };
  },
  helperFunctions: () => {
    return {};
  },
  options: { removeIfEmpty: true },
});
