import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { SCOPE } from '../../lib/state/scope_spec';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r'];
export const command = 'restack';
export const canonical = 'downstack restack';
export const description =
  'From trunk to the current branch, restack each branch on its parent.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    restackBranches({ relative: true, scope: SCOPE.DOWNSTACK }, context)
  );
