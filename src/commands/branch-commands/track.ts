import yargs from 'yargs';
import { trackBranch } from '../../actions/track_branch';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Branch to begin tracking. Defaults to the current branch.`,
    demandOption: false,
    positional: true,
    type: 'string',
    hidden: true,
  },
  parent: {
    describe: `The tracked branch's parent. If unset, prompts for a parent branch`,
    demandOption: false,
    positional: false,
    type: 'string',
    alias: 'p',
  },
  force: {
    describe: `Sets the parent to the most recent tracked ancestor of the branch being tracked. Takes precedence over \`--parent\``,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: 'f',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'track [branch]';
export const canonical = 'branch track';
export const aliases = ['tr'];
export const description = [
  'Start tracking the current (or provided) branch with Graphite by selecting its parent.',
  'This command can also be used to fix corrupted Graphite metadata.',
].join(' ');
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await trackBranch(
        {
          branchName: argv.branch,
          parentBranchName: argv.parent,
          force: argv.force,
        },
        context
      )
  );
