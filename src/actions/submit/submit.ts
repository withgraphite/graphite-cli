import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import chalk from 'chalk';
import { API_SERVER } from '../../lib/api';
import { execStateConfig } from '../../lib/config/exec_state_config';
import { TContext } from '../../lib/context/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { cliAuthPrecondition } from '../../lib/preconditions';
import { getSurvey, showSurvey } from '../../lib/telemetry/survey/survey';
import {
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess,
} from '../../lib/utils';
import { assertUnreachable } from '../../lib/utils/assert_unreachable';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
import { getPRInfoForBranches } from './prepare_branches';
import { pushBranchesToRemote } from './push_branches';
import { getValidBranchesToSubmit } from './validate_branches';

export type TSubmitScope = TScope | 'BRANCH';

type TPRSubmissionInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.params
>['prs'];

export type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']
>;

type TSubmittedPRResponse = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>['prs']
>;

type TSubmittedPR = {
  request: TSubmittedPRRequest;
  response: TSubmittedPRResponse;
};

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

  logInfo(
    chalk.blueBright(
      `📂 [Step 4] Opening/updating PRs on GitHub for pushed branches...`
    )
  );

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

async function submitPullRequests(
  args: {
    submissionInfoWithBranches: (Unpacked<TPRSubmissionInfo> & {
      branch: Branch;
    })[];
    cliAuthToken: string;
  },
  context: TContext
) {
  if (!args.submissionInfoWithBranches.length) {
    logInfo(`No eligible branches to create/update PRs for.`);
    logNewline();
    return;
  }

  const prInfo = await requestServerToSubmitPRs(
    args.cliAuthToken,
    args.submissionInfoWithBranches,
    context
  );

  saveBranchPRInfo(prInfo, context);
  printSubmittedPRInfo(prInfo);
}

const SUCCESS_RESPONSE_CODE = 200;

const UNAUTHORIZED_RESPONSE_CODE = 401;

async function requestServerToSubmitPRs(
  cliAuthToken: string,
  submissionInfo: TPRSubmissionInfo,
  context: TContext
) {
  try {
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.submitPullRequests,
      {
        authToken: cliAuthToken,
        repoOwner: context.repoConfig.getRepoOwner(),
        repoName: context.repoConfig.getRepoName(),
        prs: submissionInfo,
      }
    );

    if (
      response._response.status === SUCCESS_RESPONSE_CODE &&
      response._response.body
    ) {
      const requests: { [head: string]: TSubmittedPRRequest } = {};
      submissionInfo.forEach((prRequest) => {
        requests[prRequest.head] = prRequest;
      });

      return response.prs.map((prResponse) => {
        return {
          request: requests[prResponse.head],
          response: prResponse,
        };
      });
    } else if (response._response.status === UNAUTHORIZED_RESPONSE_CODE) {
      throw new PreconditionsFailedError(
        'Your Graphite auth token is invalid/expired.\n\nPlease obtain a new auth token by visiting https://app.graphite.dev/activate.'
      );
    } else {
      throw new ExitFailedError(
        `unexpected server response (${
          response._response.status
        }).\n\nResponse: ${JSON.stringify(response)}`
      );
    }
  } catch (error) {
    throw new ExitFailedError(`Failed to submit PRs`, error);
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

function printSubmittedPRInfo(prs: TSubmittedPR[]): void {
  if (!prs.length) {
    logNewline();
    logInfo(
      chalk.blueBright('✅ All PRs up-to-date on GitHub; no updates necessary.')
    );
    logNewline();
    return;
  }

  prs.forEach((pr) => {
    let status: string = pr.response.status;
    switch (pr.response.status) {
      case 'updated':
        status = `${chalk.yellow('(' + status + ')')}`;
        break;
      case 'created':
        status = `${chalk.green('(' + status + ')')}`;
        break;
      case 'error':
        status = `${chalk.red('(' + status + ')')}`;
        break;
      default:
        assertUnreachable(pr.response);
    }

    if ('error' in pr.response) {
      logError(`Error in submitting ${pr.response.head}: ${pr.response.error}`);
    } else {
      logSuccess(
        `${pr.response.head}: ${chalk.reset(pr.response.prURL)} ${status}`
      );
    }
  });
  logNewline();
}

function saveBranchPRInfo(prs: TSubmittedPR[], context: TContext): void {
  prs.forEach(async (pr) => {
    if (pr.response.status === 'updated' || pr.response.status === 'created') {
      const branch = await Branch.branchWithName(pr.response.head, context);
      branch.setPRInfo({
        number: pr.response.prNumber,
        url: pr.response.prURL,
        base: pr.request.base,
      });
    }
  });
}
