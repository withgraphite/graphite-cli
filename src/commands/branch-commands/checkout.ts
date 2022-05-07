import yargs from 'yargs';
import { interactiveBranchSelection } from '../../actions/interactive_branch_selection';
import { profile } from '../../lib/telemetry/profile';
import { checkoutBranch } from '../../lib/utils/checkout_branch';

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
export const description = 'Checkout a branch in a stack';
export const aliases = ['co'];
export const builder = args;

export const handler = async (args: argsT): Promise<void> => {
  return profile(args, canonical, async (context) => {
    const branch =
      args.branch ??
      (await interactiveBranchSelection(context, {
        message: 'Checkout a branch',
      }));
    checkoutBranch(branch);
  });
};
