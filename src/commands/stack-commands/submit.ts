import { profile } from '../../lib/telemetry';
import type { argsT } from '../shared-commands/submit';
import { newSubmitAction } from '../../actions/submit/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const canonical = 'stack submit';
export const description =
  'Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.';

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async () => {
    await newSubmitAction({
      scope: 'FULLSTACK',
      editPRFieldsInline: argv.edit,
      createNewPRsAsDraft: argv.draft,
      dryRun: argv['dry-run'],
      updateOnly: argv['update-only'],
    });
  });
};
