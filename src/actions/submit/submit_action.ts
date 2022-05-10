import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import chalk from 'chalk';
import prompts from 'prompts';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context';
import { KilledError } from '../../lib/errors';
import { cliAuthPrecondition } from '../../lib/preconditions';
import { getSurvey, showSurvey } from '../../lib/telemetry/survey/survey';
import { logInfo, logNewline } from '../../lib/utils/splog';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
import { getPRInfoForBranches } from './prepare_branches';
import { push } from './push_branch';
import { pushMetadataRef } from './push_metadata';
import { submitPullRequest } from './submit_prs';
import { getValidBranchesToSubmit } from './validate_branches';

export type TSubmitScope = TScope | 'BRANCH';

export type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']
>;
export type TPRSubmissionInfoWithBranch = TSubmittedPRRequest & {
  branch: Branch;
};

export type TPRSubmissionInfoWithBranches = TPRSubmissionInfoWithBranch[];

export async function submitAction(
  args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchesToSubmit?: Branch[];
    reviewers: boolean;
    confirm: boolean;
  },
  context: TContext
): Promise<void> {
  // Check CLI pre-condition to warn early
  const cliAuthToken = cliAuthPrecondition(context);
  if (args.dryRun) {
    logInfo(
      chalk.yellow(
        `Running submit in 'dry-run' mode. No branches will be pushed and no PRs will be opened or updated.`
      )
    );
    logNewline();
    args.editPRFieldsInline = false;
  }

  if (!execStateConfig.interactive()) {
    args.editPRFieldsInline = false;
    args.reviewers = false;

    logInfo(
      `Running in non-interactive mode. Inline prompts to fill PR fields will be skipped${
        args.draftToggle === undefined
          ? ' and new PRs will be created in draft mode'
          : ''
      }.`
    );
    logNewline();
  }

  // args.branchesToSubmit is for the sync flow. Skips validation.
  const branchesToSubmit =
    args.branchesToSubmit ??
    (await getValidBranchesToSubmit(args.scope, context));

  if (!branchesToSubmit) {
    return;
  }

  const submissionInfoWithBranches = await getPRInfoForBranches(
    {
      branches: branchesToSubmit,
      editPRFieldsInline: args.editPRFieldsInline,
      draftToggle: args.draftToggle,
      updateOnly: args.updateOnly,
      reviewers: args.reviewers,
      dryRun: args.dryRun,
    },
    context
  );

  if (await shouldAbort(args.dryRun, args.confirm)) {
    return;
  }

  logInfo(
    chalk.blueBright('📂 Pushing to remote and creating/updating PRs...')
  );

  for (const submissionInfoWithBranch of submissionInfoWithBranches) {
    push(submissionInfoWithBranch.branch, context);
    await submitPullRequest(
      { submissionInfoWithBranch, cliAuthToken },
      context
    );
    pushMetadataRef(submissionInfoWithBranch.branch, context);
  }

  const survey = await getSurvey(context);
  if (survey) {
    await showSurvey(survey, context);
  }
}

async function shouldAbort(
  dryRun: boolean,
  confirm: boolean
): Promise<boolean> {
  if (dryRun) {
    logInfo(chalk.blueBright('✅ Dry run complete.'));
    return true;
  }

  if (
    execStateConfig.interactive() &&
    confirm &&
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
    logInfo(chalk.blueBright('🛑 Aborted submit.'));
    return true;
  }

  return false;
}
