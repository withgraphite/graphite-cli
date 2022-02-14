import { submitAction } from '../../actions/submit/submit';
import { profile } from '../../lib/telemetry';
import type { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const canonical = 'stack submit';
export const description =
  'Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.';

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async () => {
    await submitAction({
      scope: 'FULLSTACK',
      editPRFieldsInline: argv.edit,
      draftToggle: argv.draft,
      dryRun: argv['dry-run'],
      updateOnly: argv['update-only'],
      reviewers: argv.reviewers,
    });
  });
};
