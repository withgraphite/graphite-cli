import yargs from 'yargs';
import { currentBranchOntoAction } from '../../actions/onto/current_branch_onto';
import { profile } from '../../lib/telemetry';

const args = {
  branch: {
    describe: `The branch to rebase the current stack onto.`,
    demandOption: true,
    optional: false,
    positional: true,
    type: 'string',
  },
} as const;

export const command = 'onto <branch>';
export const canonical = 'upstack onto';
export const description =
  'Rebase all upstack branches onto the latest commit (tip) of the target branch.';
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    await currentBranchOntoAction({
      onto: argv.branch,
      mergeConflictCallstack: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
    });
  });
};
