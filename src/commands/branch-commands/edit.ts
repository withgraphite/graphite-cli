import yargs from 'yargs';
import { editBranchAction } from '../../actions/edit_branch';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['e'];
export const command = 'edit';
export const canonical = 'branch edit';
export const description =
  'Run an interactive rebase on the entire current branch and fix upstack branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => editBranchAction(context));
};
