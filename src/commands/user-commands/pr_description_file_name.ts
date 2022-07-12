import chalk from 'chalk';
import yargs from 'yargs';
import { graphiteWithoutRepo } from '../../lib/runner';

const args = {
  set: {
    demandOption: false,
    default: '',
    type: 'string',
    describe: 'Set default PR description file name for Graphite. eg --set EDIT_DESCRIPTION',
  },
  unset: {
    demandOption: false,
    default: false,
    type: 'boolean',
    describe: 'Unset default PR description file name for Graphite. eg --unset',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const command = 'pr-description-file-name';
export const description = 'The file name for the PR description created by Graphite';
export const canonical = 'user pr-description-file-name';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    if (argv.set) {
      context.userConfig.update((data) => (data.prDescriptionFileName = argv.set));
      context.splog.info(`PR description file name set to ${chalk.cyan(argv.set)}`);
    } else if (argv.unset) {
      context.userConfig.update((data) => (data.prDescriptionFileName = undefined));
      context.splog.info(
        `PR description file name preference erased. Defaulting to a random file name.`
      );
    } else {
      context.userConfig.data.prDescriptionFileName
        ? context.splog.info(chalk.cyan(context.userConfig.data.prDescriptionFileName))
        : context.splog.info(
            `PR description file name is not set. Graphite will use a random file name.`
          );
    }
  });
};
