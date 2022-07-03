import * as t from '@withgraphite/retype';
import { getGitEditor, getGitPager } from '../git/git_config';
import { spiffy } from './spiffy';

const schema = t.shape({
  branchPrefix: t.optional(t.string),
  branchDate: t.optional(t.boolean),
  branchReplacement: t.optional(
    t.unionMany([t.literal('_'), t.literal('-'), t.literal('')])
  ),
  authToken: t.optional(t.string),
  tips: t.optional(t.boolean),
  editor: t.optional(t.string),
  pager: t.optional(t.string),
  restackCommitterDateIsAuthorDate: t.optional(t.boolean),
});

export const userConfigFactory = spiffy({
  schema,
  defaultLocations: [
    {
      relativePath: '.graphite_user_config',
      relativeTo: 'USER_HOME',
    },
  ],
  initialize: () => {
    return {};
  },
  helperFunctions: (data) => {
    return {
      getEditor: () => {
        // If we don't have an editor set, do what git would do
        return (
          data.editor ??
          getGitEditor() ??
          process.env.GIT_EDITOR ??
          process.env.EDITOR ??
          'vi'
        );
      },
      getPager: () => {
        // If we don't have a pager set, do what git would do
        return (
          data.pager ??
          getGitPager() ??
          process.env.GIT_PAGER ??
          process.env.PAGER ??
          'less'
        );
      },
    };
  },
});

export type TUserConfig = ReturnType<typeof userConfigFactory.load>;
