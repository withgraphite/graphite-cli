import chalk from 'chalk';
import yargs from 'yargs';
import { currentBranchOnto } from '../../actions/current_branch_onto';
import { interactiveBranchSelection } from '../../actions/interactive_branch_selection';
import { profile } from '../../lib/telemetry/profile';

const args = {
  branch: {
    describe: `Optional branch to rebase the current stack onto.`,
    demandOption: false,
    positional: true,
    type: 'string',
  },
} as const;

export const command = 'onto [branch]';
export const canonical = 'upstack onto';
export const description =
  'Rebase all upstack branches onto the latest commit (tip) of the target branch.';
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    currentBranchOnto(
      argv.branch ??
        (await interactiveBranchSelection(context, {
          message: `Choose a new base for ${chalk.yellow(
            context.metaCache.currentBranch
          )}`,
          omitCurrentUpstack: true,
        })),
      context
    );
  });
};
