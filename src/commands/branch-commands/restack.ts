import yargs from 'yargs';
import { restackBranches } from '../../actions/restack';
import { SCOPE } from '../../lib/engine/scope_spec';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['r', 'fix', 'f'];
export const command = 'restack';
export const canonical = 'branch restack';
export const description = 'Restack the current branch onto its parent.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    restackBranches({ relative: true, scope: SCOPE.BRANCH }, context)
  );
