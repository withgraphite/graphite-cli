import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

export const prInfoConfigFactory = composeConfig({
  schema: t.shape({
    prInfoToUpsert: graphiteCLIRoutes.pullRequestInfo.response.prs,
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

export type TPRInfoConfig = ReturnType<typeof prInfoConfigFactory.load>;
