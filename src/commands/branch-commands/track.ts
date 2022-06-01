import yargs from 'yargs';
import { trackBranch } from '../../actions/track_branch';
import { profile } from '../../lib/telemetry/profile';

const args = {
  branch: {
    describe: `Branch to begin tracking.`,
    demandOption: true,
    positional: true,
    type: 'string',
  },
  force: {
    describe: [
      'Will not prompt for confirmation before changing the parent of an already tracked branch.',
      "Use with care! Required to change a valid branch's parent if --no-interactive is set.",
    ].join(' '),
    alias: 'f',
    default: false,
    type: 'boolean',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'track <branch>';
export const canonical = 'branch track';
export const description = [
  'Start tracking a branch with Graphite by setting its parent to the current branch.',
  'This command can also be used to fix corrupted Graphite metadata.',
].join(' ');
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    trackBranch({ branchName: argv.branch, parentBranchName: context.metaCache.currentBranchPrecondition, force: argv.force }, context)
  );
