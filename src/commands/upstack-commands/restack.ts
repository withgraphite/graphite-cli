import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r', 'fix', 'f'];
export const command = 'restack';
export const canonical = 'upstack restack';
export const description =
  'Ensure the current branch and each of its descendants is based on its parent, rebasing if necessary.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    restackBranches(
      context.metaCache.getRelativeStack(
        context.metaCache.currentBranchPrecondition,
        SCOPE.UPSTACK
      ),
      context
    )
  );
