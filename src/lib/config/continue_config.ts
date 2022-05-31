import * as t from '@withgraphite/retype';
import { composeConfig } from './compose_config';

/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 2 main things we need to do.
 *
 * 1) Complete the original rebase operation.
 * 2) Restack any additional branches that were queued.
 *
 * The below object persists the queue of branches to be restacked.
 * We also store the Graphite current branch, so that we can switch back to it.
 */
const ContinueSchema = t.shape({
  branchesToRestack: t.array(t.string),
  currentBranchOverride: t.optional(t.string),
});

export const continueConfigFactory = composeConfig({
  schema: ContinueSchema,
  defaultLocations: [
    {
      relativePath: '.gtcontinue',
      relativeTo: 'REPO',
    },
  ],
  initialize: () => {
    return { branchNames: [] };
  },
  helperFunctions: () => {
    return {} as const;
  },
  options: { removeIfEmpty: true, removeIfInvalid: true },
});

export type TContinueConfig = ReturnType<typeof continueConfigFactory.load>;
