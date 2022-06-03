import yargs from 'yargs';
import { editBranchAction } from '../../actions/edit_branch';
import { graphite } from '../../lib/runner';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['e'];
export const command = 'edit';
export const canonical = 'branch edit';
export const description =
  'Run an interactive rebase on the entire current branch and fix upstack branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) =>
    editBranchAction(context)
  );
};
