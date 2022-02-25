import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

const schema = t.shape({
  branchPrefix: t.optional(t.string),
  authToken: t.optional(t.string),
  tips: t.optional(t.boolean),
  editor: t.optional(t.string),
});

export const userConfigFactory = composeConfig({
  schema,
  defaultLocations: [
    {
      relativePath: '.graphite_user_config',
      relativeTo: 'USER_HOME',
    },
  ],
  initialize: () => {
    return {
      responses: undefined,
      postingResponse: false,
    };
  },
  helperFunctions: (data, update) => {
    return {};
  },
});

export const USER_CONFIG_OVERRIDE_ENV = 'GRAPHITE_USER_CONFIG_PATH' as const;
export const userConfig = userConfigFactory.load(
  process.env[USER_CONFIG_OVERRIDE_ENV] // allow for config location override
);
