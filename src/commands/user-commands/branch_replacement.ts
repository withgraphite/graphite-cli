import yargs from 'yargs';
import { profile } from '../../lib/telemetry/profile';
import { getBranchReplacement } from '../../lib/utils/branch_name';
import { logInfo } from '../../lib/utils/splog';

const args = {
  ['set-underscore']: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    describe: 'Use underscore (_) as the replacement character',
  },
  ['set-dash']: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    describe: 'Use dash (-) as the replacement character',
  },
  ['set-empty']: {
    demandOption: false,
    optional: true,
    type: 'boolean',
    describe:
      'Remove invalid characters from the branch name without replacing them',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'branch-replacement';
export const canonical = 'user branch-replacement';
export const description =
  'Graphite only supports alphanumeric characters, underscores, and dashes in branch names.  Use this command to set what unsupported characters will be replaced with.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async (context) => {
    if (argv['set-underscore']) {
      context.userConfig.update((data) => (data.branchReplacement = '_'));
      logInfo(`Set underscore (_) as the replacement character`);
    } else if (argv['set-dash']) {
      context.userConfig.update((data) => (data.branchReplacement = '-'));
      logInfo(`Set dash (-) as the replacement character`);
    } else if (argv['set-empty']) {
      context.userConfig.update((data) => (data.branchReplacement = ''));
      logInfo(`Invalid characters will be removed without being replaced`);
    } else {
      const replacement = getBranchReplacement(context);
      logInfo(
        `Invalid characters will be ${
          replacement === ''
            ? 'removed without being replaced'
            : `replaced with ${replacement}`
        }`
      );
    }
  });
};
