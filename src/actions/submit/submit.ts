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
  detectUnsubmittedChanges,
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess,
  logTip,
} from '../../lib/utils';
import { assertUnreachable } from '../../lib/utils/assert_unreachable';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TScope } from '../scope';
import { getPRBody } from './pr_body';
import { getPRDraftStatus } from './pr_draft';
import { getPRTitle } from './pr_title';
import { getReviewers } from './reviewers';
import { getValidBranchesToSubmit } from './validate_branches';

export type TSubmitScope = TScope | 'BRANCH';

type TPRSubmissionAction = { branch: Branch; parent: Branch } & (
  | { update: false }
  | {
      update: true;
      prNumber: number;
    }
);

type TPRSubmissionInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.params
>['prs'];

type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']
>;

type TSubmittedPRRequestWithBranch = TSubmittedPRRequest & {
  branch: Branch;
};

type TPRSubmissionInfoWithBranch = TSubmittedPRRequestWithBranch[];

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
  logInfo(
    chalk.blueBright(
      '🥞 [Step 2] Preparing to submit PRs for the following branches...'
    )
  );

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

  // Step 3: Pushing branches to remote
  logInfo(chalk.blueBright('➡️  [Step 3] Pushing branches to remote...'));
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
      branchesPushedToRemote: branchesPushedToRemote,
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
    branchesPushedToRemote: Branch[];
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

/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 *
 * Notably, we do not yet allow users to update the PR title, body, etc.
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
async function getPRInfoForBranches(
  args: {
    branches: Branch[];
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: boolean;
  },
  context: TContext
): Promise<TPRSubmissionInfoWithBranch> {
  return await Promise.all(
    args.branches
      .map((branch) => {
        // The branch here should always have a parent - above, the branches we've
        // gathered should exclude trunk which ensures that every branch we're submitting
        // a PR for has a valid parent.
        const parent = branch.getParentFromMeta(context);
        if (parent === undefined) {
          throw new PreconditionsFailedError(
            `Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
          );
        }
        const prNumber = branch.getPRInfo()?.number;

        const status =
          prNumber === undefined
            ? args.updateOnly
              ? 'NOOP'
              : 'CREATE'
            : branch.isBaseSameAsRemotePr(context)
            ? 'RESTACK'
            : detectUnsubmittedChanges(branch)
            ? 'CHANGE'
            : args.draftToggle === undefined
            ? 'NOOP'
            : args.draftToggle
            ? 'DRAFT'
            : 'PUBLISH';

        logInfo(
          `▸ ${chalk.cyan(branch.name)} (${
            {
              CREATE: 'Create',
              CHANGE: 'Update - code changes/rebase',
              DRAFT: 'Convert to draft - set draft status',
              NOOP: 'No-op',
              PUBLISH: 'Ready for review - set draft status',
              RESTACK: 'Update - restacked',
            }[status]
          })`
        );
        return args.dryRun || status === 'NOOP'
          ? undefined
          : {
              branch,
              parent,
              ...(status !== 'CREATE'
                ? { update: true, prNumber }
                : { update: false }),
            };
      })
      .filter((action): action is TPRSubmissionAction => action !== undefined)
      .map(async (action) => {
        return action.update
          ? {
              action: 'update' as const,
              prNumber: action.prNumber,
              draft: args.draftToggle,
              head: action.branch.name,
              headSha: action.branch.getCurrentRef(),
              base: action.parent.name,
              baseSha: action.branch.getParentBranchSha(),
              branch: action.branch,
            }
          : await getPRCreationInfo(
              {
                branch: action.branch,
                parentBranchName: action.parent.name,
                editPRFieldsInline: args.editPRFieldsInline,
                draftToggle: args.draftToggle,
                reviewers: args.reviewers,
              },
              context
            );
      })
  );
}

function pushBranchesToRemote(branches: Branch[], context: TContext): Branch[] {
  const branchesPushedToRemote: Branch[] = [];

  if (!branches.length) {
    logInfo(`No eligible branches to push.`);
    logNewline();
    return [];
  }

  branches.forEach((branch) => {
    logInfo(
      `Pushing ${branch.name} with force-with-lease (will not override external commits to remote)...`
    );

    const output = gpExecSync(
      {
        // redirecting stderr to stdout here because 1) git prints the output
        // of the push command to stderr 2) we want to analyze it but Node's
        // execSync makes analyzing stderr extremely challenging
        command: [
          `git push ${context.repoConfig.getRemote()}`,
          `--force-with-lease ${branch.name} 2>&1`,
          ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
        ].join(' '),
        options: {
          printStdout: true,
        },
      },
      (err) => {
        logError(`Failed to push changes for ${branch.name} to remote.`);

        logTip(
          `There may be external commits on remote that were not overwritten with the attempted push.
          \n Use 'git pull' to pull external changes and retry.`,
          context
        );
        throw new ExitFailedError(err.stderr.toString());
      }
    )
      .toString()
      .trim();

    if (!output.includes('Everything up-to-date')) {
      branchesPushedToRemote.push(branch);
    }
  });

  return branchesPushedToRemote;
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

async function getPRCreationInfo(
  args: {
    branch: Branch;
    parentBranchName: string;
    editPRFieldsInline: boolean;
    draftToggle: boolean | undefined;
    reviewers: boolean;
  },
  context: TContext
): Promise<TSubmittedPRRequestWithBranch> {
  logInfo(
    `Enter info for new pull request for ${chalk.yellow(args.branch.name)} ▸ ${
      args.parentBranchName
    }:`
  );

  const submitInfo = {
    title: await getPRTitle(
      {
        branch: args.branch,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    ),
    body: await getPRBody(
      {
        branch: args.branch,
        editPRFieldsInline: args.editPRFieldsInline,
      },
      context
    ),
    reviewers: await getReviewers({
      fetchReviewers: args.reviewers,
    }),
  };
  args.branch.upsertPriorSubmitInfo(submitInfo);

  const createAsDraft = args.draftToggle ?? (await getPRDraftStatus());

  // Log newline at the end to create some visual separation to the next
  // interactive PR section or status output.
  logNewline();

  return {
    ...submitInfo,
    action: 'create',
    draft: createAsDraft,
    head: args.branch.name,
    headSha: args.branch.getCurrentRef(),
    base: args.parentBranchName,
    baseSha: args.branch.getParentBranchSha(),
    branch: args.branch,
  };
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
