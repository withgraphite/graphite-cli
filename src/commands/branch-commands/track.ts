import { TContext } from 'src/lib/context';
import yargs from 'yargs';
import {
  trackBranch,
  trackBranchInteractive,
} from '../../actions/track_branch';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Branch to begin tracking.`,
    demandOption: false,
    positional: true,
    type: 'string',
  },
  parent: {
    describe: `The tracked branch's parent. Defaults to the current branch.`,
    demandOption: false,
    positional: false,
    type: 'string',
    alias: 'p',
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

export const command = 'track [branch]';
export const canonical = 'branch track';
export const aliases = ['tr'];
export const description = [
  'Start tracking a branch with Graphite by setting its parent to (by default) the current branch.',
  'This command can also be used to fix corrupted Graphite metadata.',
].join(' ');
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) => {
    const { branchName, parentBranchName } = parseBranchNames(argv, context);

    branchName
      ? await trackBranch(
          {
            branchName,
            parentBranchName,
            force: argv.force,
          },
          context
        )
      : await trackBranchInteractive(parentBranchName, context);
  });

const parseBranchNames = (
  argv: argsT,
  context: TContext
): { branchName: string | undefined; parentBranchName: string } => {
  const branchName = argv.branch;

  if (!branchName) {
    return {
      branchName: context.metaCache.currentBranch,
      parentBranchName: context.metaCache.trunk,
    };
  }

  if (argv.parent) {
    return { branchName, parentBranchName: argv.parent };
  }

  return {
    branchName,
    parentBranchName: context.metaCache.currentBranchPrecondition,
  };
};
