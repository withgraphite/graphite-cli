import chalk from 'chalk';
import yargs from 'yargs';
import { graphiteWithoutRepo } from '../../lib/runner';

const args = {
  set: {
    demandOption: false,
    required: false,
    type: 'string',
    describe:
      'Set default pager for Graphite. eg --set "less -FRX".  To disable paging, set to the empty string (`gt user pager --set`)',
  },
  unset: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe:
      'Unset default pager for Graphite. eg --unset. Will fall back on git configuration (global.pager)',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const command = 'pager';
export const description = 'The pager used by Graphite';
export const canonical = 'user pager';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    if (typeof argv.set !== 'undefined') {
      context.userConfig.update((data) => (data.pager = argv.set));
      context.splog.info(`pager set to ${chalk.cyan(argv.set)}`);
    } else if (argv.unset) {
      context.userConfig.update((data) => (data.pager = undefined));
      context.splog.info(
        `pager preference erased. Defaulting to your git pager (currently ${chalk.cyan(
          context.userConfig.getPager()
        )})`
      );
    } else {
      typeof context.userConfig.data.pager === 'undefined'
        ? context.splog.info(
            `pager is not set. Graphite will use your git pager (currently ${chalk.cyan(
              context.userConfig.getPager()
            )})`
          )
        : context.userConfig.data.pager
        ? context.splog.info(chalk.cyan(context.userConfig.data.pager))
        : context.splog.info('pager is disabled');
    }
  });
};
