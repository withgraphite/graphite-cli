import { submitAction } from '../../actions/submit/submit_action';
import { SCOPE } from '../../lib/engine/scope_spec';
import { graphite } from '../../lib/runner';
import { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const description =
  'Idempotently force push the current branch and its descendants to GitHub, creating or updating pull requests as necessary.';
export const canonical = 'upstack submit';

export const handler = async (argv: argsT): Promise<void> => {
  await graphite(argv, canonical, async (context) => {
    context.splog.tip(
      [
        `You are submitting with upstack scope.`,
        `In common cases, we recommend you use:`,
        `▸ gt stack submit`,
        `▸ gt downstack submit`,
        `because these will ensure any downstack changes will be synced to existing PRs.`,
        `This submit will fail if the current branch's remote parent doesn't match its local base.`,
      ].join('\n')
    );
    await submitAction(
      {
        scope: SCOPE.UPSTACK,
        editPRFieldsInline: argv.edit,
        draft: argv.draft,
        publish: argv.publish,
        dryRun: argv['dry-run'],
        updateOnly: argv['update-only'],
        reviewers: argv.reviewers,
        confirm: argv.confirm,
      },
      context
    );
  });
};
