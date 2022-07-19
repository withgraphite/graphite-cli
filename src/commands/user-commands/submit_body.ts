import yargs from 'yargs';
import { graphiteWithoutRepo } from '../../lib/runner';

const args = {
  ['include-commit-messages']: {
    demandOption: false,
    type: 'boolean',
    describe:
      'Include commit messages in PR body by default.  Disable with --no-include-commit-messages.',
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'submit-body';
export const description = 'Options for default PR descriptions.';
export const canonical = 'user submit-body';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    if (argv['include-commit-messages'] === true) {
      context.userConfig.update(
        (data) => (data.submitIncludeCommitMessages = true)
      );
      context.splog.info(`default PR body will include commit messages`);
    } else if (argv['include-commit-messages'] === false) {
      context.userConfig.update(
        (data) => (data.submitIncludeCommitMessages = false)
      );
      context.splog.info(`default PR body will not include commit messages`);
    } else {
      context.userConfig.data.submitIncludeCommitMessages
        ? context.splog.info(`default PR body will include commit messages`)
        : context.splog.info(
            `default PR body will not include commit messages`
          );
    }
  });
};
