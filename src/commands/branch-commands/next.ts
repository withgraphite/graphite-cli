import yargs from 'yargs';
import {
  switchBranchAction,
  TraversalDirection,
} from '../../actions/branch_traversal';
import { execStateConfig } from '../../lib/config';
import { profile } from '../../lib/telemetry';

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

export const command = 'next [steps]';
export const canonical = 'branch next';
export const aliases = ['n', 'up'];
export const description =
  "If you're in a stack, i.e. Branch A → Branch B (you are here) → Branch C, checkout the branch directly upstack (Branch C). If there are multiple child branches above in the stack, `gt next` will prompt you to choose which branch to checkout.  Pass the `steps` arg to checkout the branch `[steps]` levels above in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await switchBranchAction(
      TraversalDirection.Next,
      {
        numSteps: argv.steps,
        interactive: execStateConfig.interactive(),
      },
      context
    );
  });
};
