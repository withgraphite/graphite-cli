import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import chalk from 'chalk';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context/context';
import { ExitFailedError } from '../../lib/errors';
import { cliAuthPrecondition } from '../../lib/preconditions';
import { getSurvey, showSurvey } from '../../lib/telemetry/survey/survey';
import { gpExecSync, logError, logInfo, logNewline } from '../../lib/utils';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
import { getPRInfoForBranches } from './prepare_branches';
import { pushBranchesToRemote } from './push_branches';
import { submitPullRequests } from './submit_prs';
import { getValidBranchesToSubmit } from './validate_branches';

export type TSubmitScope = TScope | 'BRANCH';

export type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']
>;

export async function submitAction(
  args: {
    scope: TSubmitScope;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    dryRun: boolean;
    updateOnly: boolean;
    branchesToSubmit?: Branch[];
    reviewers: boolean;
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
    logInfo(
      `Running in non-interactive mode. All new PRs will be created as draft and PR fields inline prompt will be silenced`
    );
    args.editPRFieldsInline = false;
    args.draftToggle = true;
  }

  // Step 1: Validate
  // args.branchesToSubmit is for the sync flow. Skips Steps 1.
  const branchesToSubmit =
    args.branchesToSubmit ??
    (await getValidBranchesToSubmit(args.scope, context));

  if (!branchesToSubmit) {
    return;
  }

  // Step 2: Prepare
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

  if (args.dryRun) {
    logInfo(chalk.blueBright('✅ Dry Run complete.'));
    return;
  }

  // Step 3: Push
  const branchesPushedToRemote = pushBranchesToRemote(
    submissionInfoWithBranches.map((info) => info.branch),
    context
  );

  // Step 4: Submit
  await submitPullRequests(
    {
      submissionInfoWithBranches: submissionInfoWithBranches,
      cliAuthToken: cliAuthToken,
    },
    context
  );

  logInfo(chalk.blueBright(`➡️ [Step 5] Pushing stack metadata to GitHub...`));

  await pushMetaStacks(branchesPushedToRemote);

  logNewline();
  const survey = await getSurvey(context);
  if (survey) {
    await showSurvey(survey, context);
  }
}

async function pushMetaStacks(branchesPushedToRemote: Branch[]): Promise<void> {
  if (!branchesPushedToRemote.length) {
    logInfo(`No eligible branches to push stack metadata for.`);
    return;
  }

  branchesPushedToRemote.forEach((branch) => {
    logInfo(`Pushing stack metadata for ${branch.name} to remote...`);
    gpExecSync(
      {
        command: `git push origin "+refs/branch-metadata/${branch.name}:refs/branch-metadata/${branch.name}"`,
      },
      (err) => {
        logError(`Failed to push stack metadata for ${branch.name} to remote.`);
        throw new ExitFailedError(err.stderr.toString());
      }
    );
  });
}
