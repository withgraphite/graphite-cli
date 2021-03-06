import yargs from 'yargs';
import { testStack } from '../../actions/test';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';

const args = {
  command: {
    describe: `The command you'd like to run on each branch of your upstack.`,
    demandOption: true,
    type: 'string',
    alias: 'c',
    positional: true,
    hidden: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'test <command>';
export const canonical = 'upstack test';
export const aliases = ['t'];
export const description =
  'For each of the current branch and its descendants, run the provided command and aggregate the results.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    testStack({ scope: SCOPE.UPSTACK, command: argv.command }, context)
  );
