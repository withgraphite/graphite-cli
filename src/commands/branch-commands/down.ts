import yargs from 'yargs';
import { switchBranchAction } from '../../actions/branch_traversal';
import { graphite } from '../../lib/runner';

const args = {
  steps: {
    describe: `The number of levels to traverse downstack.`,
    demandOption: false,
    default: 1,
    type: 'number',
    alias: 'n',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'down [steps]';
export const canonical = 'branch down';
export const aliases = ['d'];
export const description = 'Switch to the parent of the current branch.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await switchBranchAction(
        {
          direction: 'DOWN',
          numSteps: argv.steps,
        },
        context
      )
  );
