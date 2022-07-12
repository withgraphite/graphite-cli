import yargs from 'yargs';
import { trackStack } from '../../actions/track_branch';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Tip of the stack to begin tracking. Defaults to the current branch.`,
    demandOption: false,
    positional: true,
    type: 'string',
  },
  force: {
    describe: `Sets the parent of each branch to the most recent ancestor without interactive selection.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'f',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'track [branch]';
export const canonical = 'downstack track';
export const aliases = ['tr'];
export const description =
  "Track a series of untracked branches, by specifying each branch's parent, stopping when you reach a tracked branch.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await trackStack({ branchName: argv.branch, force: argv.force }, context)
  );
