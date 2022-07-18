import yargs from 'yargs';
import { checkoutBranch } from '../../actions/checkout_branch';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Optional branch to checkout`,
    demandOption: false,
    type: 'string',
    positional: true,
    hidden: true,
  },
  'show-untracked': {
    describe: `Include untracked branched in interactive selection`,
    demandOption: false,
    type: 'boolean',
    positional: false,
    alias: 'u',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'checkout [branch]';
export const canonical = 'branch checkout';
export const description =
  'Switch to a branch. If no branch is provided, opens an interactive selector.';
export const aliases = ['co'];
export const builder = args;

export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    checkoutBranch(
      { branchName: argv.branch, showUntracked: argv['show-untracked'] },
      context
    )
  );
