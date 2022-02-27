import yargs from 'yargs';
import {
  switchBranchAction,
  TraversalDirection,
} from '../../actions/branch_traversal';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { profile } from '../../lib/telemetry';

const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'bottom';
export const canonical = 'branch bottom';
export const aliases = ['b'];
export const description =
  "If you're in a stack: Branch A → Branch B → Branch C (you are here), checkout the branch at the bottom of the stack (Branch A).";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    await switchBranchAction(
      TraversalDirection.Bottom,
      {
        interactive: execStateConfig.interactive(),
      },
      context
    );
  });
};
