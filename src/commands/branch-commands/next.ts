import yargs from 'yargs';
import { switchBranchAction } from '../../actions/branch_traversal';
import { profile } from '../../lib/telemetry/profile';

const args = {
  steps: {
    describe: `The number of levels to traverse upstack.`,
    demandOption: false,
    default: 1,
    type: 'number',
    alias: 'n',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'up [steps]';
export const canonical = 'branch up';
export const aliases = ['u', 'next', 'n'];
export const description =
  "If you're in a stack, i.e. Branch A → Branch B (you are here) → Branch C, checkout the branch directly upstack (Branch C). If there are multiple child branches above in the stack, `gt up` will prompt you to choose which branch to checkout.  Pass the `steps` arg to checkout the branch `[steps]` levels above in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  profile(
    argv,
    canonical,
    async (context) =>
      await switchBranchAction(
        {
          direction: 'UP',
          numSteps: argv.steps,
        },
        context
      )
  );
