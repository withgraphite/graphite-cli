import chalk from 'chalk';
import yargs from 'yargs';
import { graphite } from '../../lib/runner';
import { setBranchPrefix } from '../../lib/utils/branch_name';

const args = {
  set: {
    demandOption: false,
    optional: true,
    type: 'string',
    alias: 's',
    describe: 'Set a new prefix for branch names.',
  },
  reset: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    alias: 'r',
    describe: 'Turn off branch prefixing. Takes precendence over --set',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'branch-prefix';
export const canonical = 'user branch-prefix';
export const description =
  'The prefix which Graphite will prepend to generated branch names.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    if (argv.reset) {
      context.splog.info(`Reset branch-prefix`);
      setBranchPrefix('', context);
    } else if (argv.set) {
      context.splog.info(
        `Set branch-prefix to "${chalk.green(
          setBranchPrefix(argv.set, context)
        )}"`
      );
    } else {
      context.splog.info(
        context.userConfig.data.branchPrefix ||
          'branch-prefix is not set. Try running `gt user branch-prefix --set <prefix>` to update the value.'
      );
    }
  });
};
