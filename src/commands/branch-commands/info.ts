import yargs from 'yargs';
import { showBranchAction } from '../../actions/show_branch';
import { graphite } from '../../lib/runner';

const args = {
  patch: {
    describe: `Show the changes made by each commit.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'p',
  },
  description: {
    describe: `Show the PR description, if it exists.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'd',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'info';
export const canonical = 'branch info';
export const aliases = ['i'];
export const description = 'Display information about the current branch.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    await showBranchAction(
      context.metaCache.currentBranchPrecondition,
      { patch: argv.patch, description: argv.description },
      context
    );
  });
};
