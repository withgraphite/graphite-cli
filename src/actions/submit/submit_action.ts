import chalk from 'chalk';
import prompts from 'prompts';
import { TContext } from '../../lib/context';
import { TScopeSpec } from '../../lib/engine/scope_spec';
import { KilledError } from '../../lib/errors';
import { cliAuthPrecondition } from '../../lib/preconditions';
import { getSurvey, showSurvey } from '../../lib/telemetry/survey/survey';
import { getPRInfoForBranches } from './prepare_branches';
import { push } from './push_branch';
import { submitPullRequest } from './submit_prs';
import { getValidBranchesToSubmit } from './validate_branches';

export async function submitAction(
  args: {
    scope: TScopeSpec;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchNames?: string[];
    reviewers: boolean;
    confirm: boolean;
  },
  context: TContext
): Promise<void> {
  // Check CLI pre-condition to warn early
  const cliAuthToken = cliAuthPrecondition(context);
  if (args.dryRun) {
    context.splog.logInfo(
      chalk.yellow(
        `Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`
      )
    );
    context.splog.logNewline();
    args.editPRFieldsInline = false;
  }

  if (!context.interactive) {
    args.editPRFieldsInline = false;
    args.reviewers = false;

    context.splog.logInfo(
      `Running in non-interactive mode. Inline prompts to fill PR fields will be skipped${
        args.draftToggle === undefined
          ? ' and new PRs will be created in draft mode'
          : ''
      }.`
    );
    context.splog.logNewline();
  }

  // args.branchesToSubmit is for the sync flow. Skips validation.
  const branchNames =
    args.branchNames ?? (await getValidBranchesToSubmit(args.scope, context));

  if (!branchNames.length) {
    return;
  }

  const submissionInfos = await getPRInfoForBranches(
    {
      branchNames,
      editPRFieldsInline: args.editPRFieldsInline,
      draftToggle: args.draftToggle,
      updateOnly: args.updateOnly,
      reviewers: args.reviewers,
      dryRun: args.dryRun,
    },
    context
  );

  if (await shouldAbort(args, context)) {
    return;
  }

  context.splog.logInfo(
    chalk.blueBright('📂 Pushing to remote and creating/updating PRs...')
  );

  for (const submissionInfo of submissionInfos) {
    push(submissionInfo.head, context);
    await submitPullRequest(
      { submissionInfo: [submissionInfo], cliAuthToken },
      context
    );
  }

  const survey = await getSurvey(context);
  if (survey) {
    await showSurvey(survey, context);
  }
}

async function shouldAbort(
  args: { dryRun: boolean; confirm: boolean },
  context: TContext
): Promise<boolean> {
  if (args.dryRun) {
    context.splog.logInfo(chalk.blueBright('✅ Dry run complete.'));
    return true;
  }

  if (
    context.interactive &&
    args.confirm &&
    !(
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: 'Continue with this submit operation?',
          initial: true,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).value
  ) {
    context.splog.logInfo(chalk.blueBright('🛑 Aborted submit.'));
    return true;
  }

  return false;
}
