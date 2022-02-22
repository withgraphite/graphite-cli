import yargs from 'yargs';
import {
  switchBranchAction,
  TraversalDirection,
} from '../../actions/branch_traversal';
import { execStateConfig } from '../../lib/config';
import { profile } from '../../lib/telemetry';

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

export const command = 'prev [steps]';
export const canonical = 'branch prev';
export const aliases = ['p', 'down'];
export const description =
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C, checkout the branch directly downstack (Branch A). Pass the `steps` arg to checkout the branch `[steps]` levels below in the stack.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await switchBranchAction(
      TraversalDirection.Previous,
      {
        numSteps: argv.steps,
        interactive: execStateConfig.interactive(),
      },
      context
    );
  });
};
