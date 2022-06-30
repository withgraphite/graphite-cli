import yargs from 'yargs';
import { graphiteWithoutRepo } from '../../lib/runner';

const args = {
  ['use-author-date']: {
    demandOption: false,
    type: 'boolean',
    describe: [
      'Passes `--committer-date-is-author-date` to the internal git rebase for restack operations.',
      'Instead of using the current time as the committer date, use the author date of the commit being rebased as the committer date.',
      'To return to default behavior, pass in `--no-use-author-date`',
    ].join('\n'),
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = 'restack-date';
export const description =
  'Configure how committer date is handled by restack internal rebases.';
export const canonical = 'user restack-date';
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    if (typeof argv['use-author-date'] === undefined) {
      context.splog.info(
        `\`--committer-date-is-author-date\` will ${
          context.userConfig.data.restackCommitterDateIsAuthorDate ? '' : 'not '
        }be passed to the internal \`git rebase\``
      );
    } else if (argv['use-author-date']) {
      context.userConfig.update(
        (data) => (data.restackCommitterDateIsAuthorDate = true)
      );
      context.splog.info(
        '`--committer-date-is-author-date` will be passed to the internal `git rebase`'
      );
    } else {
      context.userConfig.update(
        (data) => (data.restackCommitterDateIsAuthorDate = false)
      );
      context.splog.info(
        '`--committer-date-is-author-date` will not be passed to the internal `git rebase`'
      );
    }
  });
};
