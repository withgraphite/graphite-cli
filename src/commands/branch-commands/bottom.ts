import yargs from 'yargs';
import { switchBranchAction } from '../../actions/branch_traversal';
import { graphite } from '../../lib/runner';

const args = {} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'bottom';
export const canonical = 'branch bottom';
export const aliases = ['b'];
export const description =
  'Switch to the first branch from trunk in the current stack.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) =>
      await switchBranchAction(
        {
          direction: 'BOTTOM',
        },
        context
      )
  );
