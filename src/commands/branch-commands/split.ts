import yargs from 'yargs';
import { splitCurrentBranch } from '../../actions/split';
import { graphite } from '../../lib/runner';

const args = {
  ['by-commit']: {
    describe: `Split by commit - slice up the history of this branch.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: ['c', 'commit'],
  },
  ['by-hunk']: {
    describe: `Split by hunk - split into new single-commit branches.`,
    demandOption: false,
    default: false,
    type: 'boolean',
    alias: ['h', 'hunk'],
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'split';
export const canonical = 'branch split';
export const aliases = ['sp'];
export const description =
  'Split the current branch into multiple single-commit branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    splitCurrentBranch(
      {
        style: argv['by-hunk']
          ? 'hunk'
          : argv['by-commit']
          ? 'commit'
          : undefined,
      },
      context
    )
  );
