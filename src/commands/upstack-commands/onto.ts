import chalk from 'chalk';
import yargs from 'yargs';
import { currentBranchOnto } from '../../actions/current_branch_onto';
import { interactiveBranchSelection } from '../../actions/log';
import { graphite } from '../../lib/runner';

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
export const aliases = ['o'];
export const description =
  'Rebase the current branch onto the latest commit of target branch and restack all of its descendants.';
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    currentBranchOnto(
      argv.branch ??
        (await interactiveBranchSelection(
          {
            message: `Choose a new base for ${chalk.yellow(
              context.metaCache.currentBranchPrecondition
            )} (autocomplete or arrow keys)`,
            omitCurrentBranch: true,
          },
          context
        )),
      context
    );
  });
};
