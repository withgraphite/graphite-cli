import yargs from 'yargs';
import { getAction } from '../../actions/sync/get';
import { graphite } from '../../lib/runner';

const args = {
  branch: {
    describe: `Branch to get from remote`,
    demandOption: false,
    type: 'string',
    positional: true,
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'get [branch]';
export const canonical = 'downstack get';
export const description =
  'Get branches from trunk to the specified branch from remote, prompting the user to resolve conflicts.';
export const builder = args;
export const aliases = ['g'];
export const handler = async (argv: argsT): Promise<void> =>
  graphite(
    argv,
    canonical,
    async (context) => await getAction(argv.branch, context)
  );
