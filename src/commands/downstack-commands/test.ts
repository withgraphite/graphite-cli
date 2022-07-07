import yargs from 'yargs';
import { testStack } from '../../actions/test';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';

const args = {
  command: {
    describe: `The command you'd like to run on each branch of your downstack.`,
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
export const canonical = 'downstack test';
export const aliases = ['t'];
export const description =
  'From trunk to the current branch, run the provided command on each branch and aggregate the results.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(argv, canonical, async (context) =>
    testStack(
      {
        scope: SCOPE.DOWNSTACK,
        includeTrunk: argv.trunk,
        command: argv.command,
      },
      context
    )
  );
