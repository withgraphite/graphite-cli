import * as t from '@withgraphite/retype';
import { getGitEditor } from '../git/git_editor';
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
  restackCommitterDateIsAuthorDate: t.optional(t.boolean),
  submitIncludeCommitMessages: t.optional(t.boolean),
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
    };
  },
});

export type TUserConfig = ReturnType<typeof userConfigFactory.load>;
