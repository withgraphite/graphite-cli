import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

const schema = t.shape({
  message: t.optional(
    t.shape({
      contents: t.string,
      cliVersion: t.string,
    })
  ),
});

export const messageConfigFactory = composeConfig({
  schema,
  defaultLocations: [
    {
      relativePath: '.graphite_upgrade_message',
      relativeTo: 'USER_HOME',
    },
  ],
  initialize: () => {
    return {
      message: undefined,
    };
  },
  helperFunctions: (data, update) => {
    return {};
  },
  options: { removeIfEmpty: true },
});

export type TMessageConfig = ReturnType<typeof messageConfigFactory.load>;
