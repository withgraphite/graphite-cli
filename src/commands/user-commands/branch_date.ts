import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { getBranchDateEnabled } from '../../lib/utils/branch_name';
import { logInfo } from '../../lib/utils/splog';

const args = {
  enable: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    describe: 'Enable date in auto-generated branch names',
  },
  disable: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    describe: 'Disable date in auto-generated branch names',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'branch-date';
export const canonical = 'user branch-date';
export const description =
  "Toggle prepending date to auto-generated branch names (i.e. when you don't specify a branch name when calling `gt branch create`).";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv.enable) {
      context.userConfig.update((data) => (data.branchDate = true));
      logInfo(`Enabled date`);
    } else if (argv.disable) {
      context.userConfig.update((data) => (data.branchDate = false));
      logInfo(`Disabled date`);
    } else {
      logInfo(
        `Branch date is ${
          getBranchDateEnabled(context) ? 'enabled' : 'disabled'
        }`
      );
    }
  });
};
