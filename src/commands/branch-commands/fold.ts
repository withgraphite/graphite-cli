import yargs from 'yargs';
import { foldCurrentBranch } from '../../actions/fold_branch';
import { graphite } from '../../lib/runner';

const args = {
  keep: {
    describe: `Keeps the name of the current branch instead of using the name of its parent.`,
    demandOption: false,
    type: 'boolean',
    alias: 'k',
    default: false,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = ['f'];
export const command = 'fold';
export const canonical = 'branch fold';
export const description =
  "Fold a branch's changes into its parent, update dependencies of descendants of the new combined branch, and restack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    foldCurrentBranch(argv.keep, context)
  );
