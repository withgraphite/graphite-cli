import { submitAction } from '../../actions/submit/submit_action';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';
import type { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const description =
  'Idempotently force push the current branch to GitHub, creating or updating a pull request.';
export const canonical = 'branch submit';

export const handler = async (argv: argsT): Promise<void> => {
  await graphite(argv, canonical, async (context) => {
    context.splog.tip(
      [
        `You are submitting a pull request for a specific branch.`,
        `In common cases, we recommend you use:`,
        `▸ gt stack submit`,
        `▸ gt downstack submit`,
        `because these will ensure any downstack changes will be synced to existing PRs.`,
        `This submit will fail if the branch's remote parent doesn't match its local base.`,
      ].join('\n')
    );
    await submitAction(
      {
        scope: SCOPE.BRANCH,
        editPRFieldsInline: !argv['no-edit'] && argv.edit,
        draft: argv.draft,
        publish: argv.publish,
        dryRun: argv['dry-run'],
        updateOnly: argv['update-only'],
        reviewers: argv.reviewers,
        confirm: argv.confirm,
        forcePush: argv.force,
        select: argv.select,
      },
      context
    );
  });
};
