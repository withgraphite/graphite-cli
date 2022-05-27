import yargs from 'yargs';
import { showBranchAction } from '../../actions/show_branch';
import { profile } from '../../lib/telemetry/profile';

const args = {
  patch: {
    describe: `Show the changes made by each commit.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'p',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'show';
export const canonical = 'branch show';
export const description = 'Display information about the current branch.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await showBranchAction(
      context.metaCache.currentBranchPrecondition,
      { patch: argv.patch },
      context
    );
  });
};
