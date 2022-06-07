import yargs from 'yargs';
import { testStack } from '../../actions/test';
import { SCOPE } from '../../lib/state/scope_spec';
import { profile } from '../../lib/telemetry/profile';

const args = {
  command: {
    describe: `The command you'd like to run on each branch of your stack.`,
    demandOption: true,
    type: 'string',
    alias: 'c',
    positional: true,
  },
  trunk: {
    describe: `Run the command on the trunk branch in addition to the rest of the stack.`,
    demandOption: false,
    default: false,
    alias: 't',
    type: 'boolean',
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'test <command>';
export const canonical = 'stack test';
export const aliases = ['t'];
export const description =
  'Checkout each branch in your stack, run the provided command, and aggregate the results. Good for finding bugs in your stack.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    testStack(
      { scope: SCOPE.STACK, includeTrunk: argv.trunk, command: argv.command },
      context
    )
  );
