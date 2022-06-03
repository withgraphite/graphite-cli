import yargs from 'yargs';
import { switchBranchAction } from '../../actions/branch_traversal';
import { graphite } from '../../lib/runner';

const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'top';
export const canonical = 'branch top';
export const aliases = ['t'];
export const description =
  "If you're in a stack: Branch A → Branch B (you are here) → Branch C → Branch D , checkout the branch at the top of the stack (Branch D). If there are multiple parent branches in the stack, `gt branch top` will prompt you to choose which branch to checkout.";

export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await switchBranchAction(
        {
          direction: 'TOP',
        },
        context
      )
  );
