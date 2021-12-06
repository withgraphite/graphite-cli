import { submitAction } from '../../actions/submit';
import { profile } from '../../lib/telemetry';
import { logTip } from '../../lib/utils';
import type { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const description =
  'Idempotently force push the current branch to GitHub, creating or updating a pull request.';
export const canonical = 'branch submit';

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async () => {
    await submitAction({
      scope: 'BRANCH',
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
      dryRun: argv['dry-run'],
    });
    logTip(
      [
        `You submitted a pull request for a specific branch.`,
        `In common cases, we recommend you use:`,
        `* 'gt stack submit'`,
        `* 'gt downstack submit'`,
        `because these will ensure any downstack changes will be synced to existing PRs.`,
      ].join('\n')
    );
  });
};
