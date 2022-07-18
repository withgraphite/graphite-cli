import yargs from 'yargs';
import { splitCurrentBranch } from '../../actions/split';
import { graphite } from '../../lib/runner';

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'split';
export const canonical = 'branch split';
export const aliases = ['sp'];
export const description =
  'Split the current branch into multiple single-commit branches.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) => splitCurrentBranch(context));
