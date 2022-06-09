import yargs from 'yargs';
import { checkoutBranch } from '../../actions/checkout_branch';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Optional branch to checkout`,
    demandOption: false,
    type: 'string',
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'checkout [branch]';
export const canonical = 'branch checkout';
export const description = 'Switch to a branch.';
export const aliases = ['co'];
export const builder = args;

export const handler = async (args: argsT): Promise<void> =>
  graphite(args, canonical, async (context) =>
    checkoutBranch(args.branch, context)
  );
