import yargs from 'yargs';
import { graphite } from '../../lib/runner';
import { getBranchReplacement } from '../../lib/utils/branch_name';

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
  'The character that will replace unsupported characters in generated branch names.';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    if (argv['set-underscore']) {
      context.userConfig.update((data) => (data.branchReplacement = '_'));
      context.splog.info(`Set underscore (_) as the replacement character`);
    } else if (argv['set-dash']) {
      context.userConfig.update((data) => (data.branchReplacement = '-'));
      context.splog.info(`Set dash (-) as the replacement character`);
    } else if (argv['set-empty']) {
      context.userConfig.update((data) => (data.branchReplacement = ''));
      context.splog.info(
        `Invalid characters will be removed without being replaced`
      );
    } else {
      const replacement = getBranchReplacement(context);
      context.splog.info(
        `Invalid characters will be ${
          replacement === ''
            ? 'removed without being replaced'
            : `replaced with ${replacement}`
        }`
      );
    }
  });
};
