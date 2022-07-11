import { submitAction } from '../../actions/submit/submit_action';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';
import type { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const canonical = 'stack submit';
export const description =
  'Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.';

export const handler = async (argv: argsT): Promise<void> => {
  await graphite(argv, canonical, async (context) => {
    await submitAction(
      {
        scope: SCOPE.STACK,
        editPRFieldsInline: !argv['no-edit'] && argv.edit,
        draft: argv.draft,
        publish: argv.publish,
        dryRun: argv['dry-run'],
        updateOnly: argv['update-only'],
        reviewers: argv.reviewers,
        confirm: argv.confirm,
        forcePush: argv.force,
      },
      context
    );
  });
};
