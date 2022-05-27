import chalk from 'chalk';
import yargs from 'yargs';
import { interactiveBranchSelection } from '../../actions/display_branches';
import { profile } from '../../lib/telemetry/profile';

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
    const branchName =
      args.branch ??
      (await interactiveBranchSelection(
        {
          message: 'Checkout a branch',
        },
        context
      ));
    if (!context.metaCache.checkoutBranch(branchName)) {
      context.splog.logError(`${branchName} is not a valid Graphite branch.`);
    } else {
      context.splog.logInfo(`Checked out ${chalk.cyan(branchName)}`);
    }
  });
};
