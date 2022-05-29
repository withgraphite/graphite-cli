import yargs from 'yargs';
import { switchBranchAction } from '../../actions/branch_traversal';
import { profile } from '../../lib/telemetry/profile';

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
export const aliases = ['d', 'prev', 'p'];
export const description =
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C, checkout the branch directly downstack (Branch A). Pass the `steps` arg to checkout the branch `[steps]` levels below in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(
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
