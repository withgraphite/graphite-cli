import chalk from 'chalk';
import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
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
  "The prefix which Graphite will prepend to all auto-generated branch names (i.e. when you don't specify a branch name when calling `gt branch create`).";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.reset) {
      context.splog.logInfo(`Reset branch-prefix`);
      setBranchPrefix('', context);
    } else if (argv.set) {
      context.splog.logInfo(
        `Set branch-prefix to "${chalk.green(
          setBranchPrefix(argv.set, context)
        )}"`
      );
    } else {
      context.splog.logInfo(
        context.userConfig.data.branchPrefix ||
          'branch-prefix is not set. Try running `gt user branch-prefix --set <prefix>` to update the value.'
      );
    }
  });
};
