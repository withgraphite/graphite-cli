import yargs from 'yargs';
import { logAction } from '../../actions/log';
import { graphite } from '../../lib/runner';

const args = {
  reverse: {
    describe: `Print the log upside down. Handy when you have a lot of branches!`,
    type: 'boolean',
    alias: 'r',
    default: false,
  },
  stack: {
    describe: `Only show ancestors and descendants of the current branch.`,
    type: 'boolean',
    alias: 's',
    default: false,
  },
  steps: {
    describe: `Only show this many levels upstack and downstack. Implies --stack.`,
    type: 'number',
    alias: 'n',
    default: undefined,
  },
  'show-untracked': {
    describe: `Include untracked branched in interactive selection`,
    demandOption: false,
    type: 'boolean',
    positional: false,
    alias: 'u',
  },
} as const;

export const command = '*';
export const description =
  'Log all branches tracked by Graphite, showing dependencies and info for each.';
export const builder = args;
export const canonical = 'log';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    logAction(
      {
        style: 'FULL',
        reverse: argv.reverse,
        branchName:
          argv.steps || argv.stack
            ? context.metaCache.currentBranchPrecondition
            : context.metaCache.trunk,
        steps: argv.steps,
        showUntracked: argv['show-untracked'],
      },
      context
    )
  );
