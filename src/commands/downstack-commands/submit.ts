import { submitAction } from '../../actions/submit/submit_action';
import { SCOPE } from '../../lib/engine/scope_spec';
import { profile } from '../../lib/telemetry/profile';
import type { argsT } from '../shared-commands/submit';

export { aliases, builder, command } from '../shared-commands/submit';
export const description =
  'Idempotently force push all downstack branches (including the current one) to GitHub, creating or updating distinct pull requests for each.';
export const canonical = 'downstack submit';

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async (context) => {
    await submitAction(
      {
        scope: SCOPE.DOWNSTACK,
        editPRFieldsInline: argv.edit,
        draftToggle: argv.draft,
        dryRun: argv['dry-run'],
        updateOnly: argv['update-only'],
        reviewers: argv.reviewers,
        confirm: argv.confirm,
      },
      context
    );
  });
};
