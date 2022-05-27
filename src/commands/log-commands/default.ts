import yargs from 'yargs';
import { printStack } from '../../actions/print_stack';
import { profile } from '../../lib/telemetry/profile';

const args = {} as const;

export const command = '*';
export const description = 'Log all stacks tracked by Graphite.';
export const builder = args;
export const canonical = 'log';

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> =>
  profile(argv, canonical, async (context) =>
    printStack(
      {
        branchName: context.metaCache.trunk,
        indentLevel: 0,
      },
      context
    )
  );
