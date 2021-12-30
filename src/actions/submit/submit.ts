import graphiteCLIRoutes from '@screenplaydev/graphite-cli-routes';
import * as t from '@screenplaydev/retype';
import { request } from '@screenplaydev/retyped-routes';
import chalk from 'chalk';
import { API_SERVER } from '../../lib/api';
import { execStateConfig, repoConfig } from '../../lib/config';
import {
  ExitFailedError,
  KilledError,
  PreconditionsFailedError,
  ValidationFailedError,
} from '../../lib/errors';
import {
  cliAuthPrecondition,
  currentBranchPrecondition,
} from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { getSurvey, showSurvey } from '../../lib/telemetry/survey/survey';
import {
  detectUnsubmittedChanges,
  gpExecSync,
  logError,
  logInfo,
  logNewline,
  logSuccess,
  logWarn,
} from '../../lib/utils';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { MetaStackBuilder, Stack } from '../../wrapper-classes';
import Branch from '../../wrapper-classes/branch';
import { TScope } from '../scope';
import { validateStack } from '../validate';
import { getPRBody } from './pr_body';
import { getPRDraftStatus } from './pr_draft';
import { getPRTitle } from './pr_title';
import prompts from 'prompts';

export type TSubmitScope = TScope | 'BRANCH';

type TPRSubmissionInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.params
>['prs'];
type TPRSubmissionInfoWithBranch = (Unpacked<TPRSubmissionInfo> & {
  branch: Branch;
})[];

type TSubmittedPRRequest = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.params>['prs']
>;
type TSubmittedPRResponse = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>['prs']
>;

type TSubmittedPR = {
  request: TSubmittedPRRequest;
  response: TSubmittedPRResponse;
};

export async function submitAction(args: {
  scope: TSubmitScope;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
  dryRun: boolean;
  updateOnly: boolean;
  branchesToSubmit?: Branch[];
}): Promise<void> {
  let branchesToSubmit;
  // Check CLI pre-condition to warn early
  const cliAuthToken = cliAuthPrecondition();
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
      `Running in interactive mode. All new PRs will be created as draft and PR fields inline prompt will be silenced`
    );
    args.editPRFieldsInline = false;
    args.createNewPRsAsDraft = true;
  }

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
      `Running in interactive mode. All new PRs will be created as draft and PR fields inline prompt will be silenced`
    );
    args.editPRFieldsInline = false;
    args.createNewPRsAsDraft = true;
  }

  // This supports the use case in sync.ts. Skips Steps 1 and 2
  if (args.branchesToSubmit) {
    branchesToSubmit = args.branchesToSubmit;
  } else {
    // Step 1: Validate
    logInfo(
      chalk.blueBright(
        `✏️  [Step 1] Validating that this Graphite stack is ready to submit...`
      )
    );
    const validationResult = await getValidBranchesToSubmit(args.scope);
    if (validationResult.abort) {
      return;
    }
    branchesToSubmit = validationResult.submittableBranches;
  }
  // Step 2: Prepare
  logInfo(
    chalk.blueBright(
      '🥞 [Step 2] Preparing to submit PRs for the following branches...'
    )
  );

  const submissionInfoWithBranches: TPRSubmissionInfoWithBranch =
    await getPRInfoForBranches({
      branches: branchesToSubmit,
      editPRFieldsInline: args.editPRFieldsInline,
      createNewPRsAsDraft: args.createNewPRsAsDraft,
      updateOnly: args.updateOnly,
      dryRun: args.dryRun,
    });

  if (args.dryRun) {
    logInfo(chalk.blueBright('✅ Dry Run complete.'));
    return;
  }

  // Step 3: Pushing branches to remote
  logInfo(chalk.blueBright('➡️  [Step 3] Pushing branches to remote...'));
  const branchesPushedToRemote = pushBranchesToRemote(
    submissionInfoWithBranches.map((info) => info.branch)
  );

  logInfo(
    chalk.blueBright(
      `📂 [Step 4] Opening/updating PRs on GitHub for pushed branches...`
    )
  );

  await submitPullRequests({
    submissionInfoWithBranches: submissionInfoWithBranches,
    branchesPushedToRemote: branchesPushedToRemote,
    cliAuthToken: cliAuthToken,
  });

  logNewline();
  const survey = await getSurvey();
  if (survey) {
    await showSurvey(survey);
  }
}

async function getValidBranchesToSubmit(scope: TSubmitScope): Promise<{
  submittableBranches: Branch[];
  closedBranches: Branch[];
  mergedBranches: Branch[];
  abort: boolean;
}> {
  let branchesToSubmit;
  try {
    if (scope === 'BRANCH') {
      const currentBranch = currentBranchPrecondition();
      branchesToSubmit = [currentBranch];
    } else {
      const stack = getStack({
        currentBranch: currentBranchPrecondition(),
        scope: scope,
      });
      validateStack(scope, stack);
      branchesToSubmit = stack.branches().filter((b) => !b.isTrunk());
    }
    logNewline();
  } catch {
    throw new ValidationFailedError(`Validation failed. Will not submit.`);
  }
  // Force a sync to link any PRs that have remote equivalents but weren't
  // previously tracked with Graphite.
  await syncPRInfoForBranches(branchesToSubmit);

  return await processBranchesInInvalidState(branchesToSubmit);
}

async function processBranchesInInvalidState(branches: Branch[]) {
  const closedBranches = branches.filter(
    (b) => b.getPRInfo()?.state === 'CLOSED'
  );
  const mergedBranches = branches.filter(
    (b) => b.getPRInfo()?.state === 'MERGED'
  );
  const submittableBranches = branches.filter(
    (b) =>
      b.getPRInfo()?.state !== 'CLOSED' || b.getPRInfo()?.state !== 'MERGED'
  );
  let abort = false;
  if (closedBranches.length > 0 || mergedBranches.length > 0) {
    logWarn(
      `PRs for the following branches in the stack have been closed or merged:`
    );
    closedBranches.forEach((b) => logWarn(`▸ ${chalk.reset(b.name)} (closed)`));
    mergedBranches.forEach((b) => logWarn(`▸ ${chalk.reset(b.name)} (merged)`));
    logWarn(`This can cause unexpected issues.`);
    if (!execStateConfig.interactive()) {
      abort = true;
      logInfo(`Aborting.`);
    } else {
      const response = await prompts(
        {
          type: 'select',
          name: 'closed_branches_options',
          message: `How would you like to proceed?`,
          choices: [
            {
              title: `Abort "stack submit" and fix manually`,
              value: 'fix_manually',
            },
            {
              title: `Continue with closed branches (best effort)`,
              value: 'continue_without_fix',
            },
          ],
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      );
      if (response.closed_branches_options === 'fix_manually') {
        abort = true;
        logInfo(`Aborting...`);
      } //TODO (nehasri): Fix branches automatically in the else option and modify submittableBranches
    }
    logNewline();
  }
  return {
    submittableBranches: submittableBranches,
    closedBranches: closedBranches,
    mergedBranches: mergedBranches,
    abort: abort,
  };
}

async function submitPullRequests(args: {
  submissionInfoWithBranches: (Unpacked<TPRSubmissionInfo> & {
    branch: Branch;
  })[];
  branchesPushedToRemote: Branch[];
  cliAuthToken: string;
}) {
  if (!args.submissionInfoWithBranches.length) {
    logInfo(`No eligible branches to create PRs for.`);
    logNewline();
    return;
  }

  const prInfo = await requestServerToSubmitPRs(
    args.cliAuthToken,
    args.submissionInfoWithBranches
  );

  saveBranchPRInfo(prInfo);
  printSubmittedPRInfo(prInfo);
}

function getStack(args: { currentBranch: Branch; scope: TScope }): Stack {
  switch (args.scope) {
    case 'UPSTACK':
      return new MetaStackBuilder().upstackInclusiveFromBranchWithParents(
        args.currentBranch
      );
    case 'DOWNSTACK':
      return new MetaStackBuilder().downstackFromBranch(args.currentBranch);
    case 'FULLSTACK':
      return new MetaStackBuilder().fullStackFromBranch(args.currentBranch);
  }
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
async function getPRInfoForBranches(args: {
  branches: Branch[];
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
  updateOnly: boolean;
  dryRun: boolean;
}): Promise<TPRSubmissionInfoWithBranch> {
  const branchPRInfo: TPRSubmissionInfoWithBranch = [];
  const newPrBranches: Branch[] = [];
  for (const branch of args.branches) {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = getBranchBaseName(branch);

    const previousPRInfo = branch.getPRInfo();
    let status, reason;
    if (previousPRInfo && branch.isBaseSameAsRemotePr()) {
      status = 'Update';
      reason = 'restacked';
      branchPRInfo.push({
        action: 'update',
        head: branch.name,
        base: parentBranchName,
        prNumber: previousPRInfo.number,
        branch: branch,
      });
    } else if (previousPRInfo && detectUnsubmittedChanges(branch)) {
      status = 'Update';
      reason = 'code changes/rebase';
      branchPRInfo.push({
        action: 'update',
        head: branch.name,
        base: parentBranchName,
        prNumber: previousPRInfo.number,
        branch: branch,
      });
    } else if (!previousPRInfo && !args.updateOnly) {
      status = 'Create';
      newPrBranches.push(branch);
    } else {
      status = `no-op`;
    }
    logInfo(
      `▸ ${chalk.cyan(branch.name)} (${status}${reason ? ' - ' + reason : ''})`
    );
  }

  // Prompt for PR creation info separately after printing
  for (const branch of newPrBranches) {
    const parentBranchName = getBranchBaseName(branch);
    const { title, body, draft } = await getPRCreationInfo({
      branch: branch,
      parentBranchName: parentBranchName,
      editPRFieldsInline: args.editPRFieldsInline,
      createNewPRsAsDraft: args.createNewPRsAsDraft,
      dryRun: args.dryRun,
    });
    branchPRInfo.push({
      action: 'create',
      head: branch.name,
      base: parentBranchName,
      title: title,
      body: body,
      draft: draft,
      branch: branch,
    });
  }

  logNewline();
  return branchPRInfo;
}

function pushBranchesToRemote(branches: Branch[]): Branch[] {
  const branchesPushedToRemote: Branch[] = [];

  if (!branches.length) {
    logInfo(`No eligible branches to push.`);
    return [];
  }

  branches.forEach((branch) => {
    logInfo(`Pushing ${branch.name}...`);

    const output = gpExecSync(
      {
        // redirecting stderr to stdout here because 1) git prints the output
        // of the push command to stderr 2) we want to analyze it but Node's
        // execSync makes analyzing stderr extremely challenging
        command: [
          `git push origin`,
          `-f ${branch.name} 2>&1`,
          ...[execStateConfig.noVerify() ? ['--no-verify'] : []],
        ].join(' '),
        options: {
          printStdout: true,
        },
      },
      (err) => {
        throw new ExitFailedError(
          `Failed to push changes for ${branch.name} to origin. Aborting...`,
          err
        );
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
  submissionInfo: TPRSubmissionInfo
) {
  try {
    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.submitPullRequests,
      {
        authToken: cliAuthToken,
        repoOwner: repoConfig.getRepoOwner(),
        repoName: repoConfig.getRepoName(),
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
  } catch (error: any) {
    throw new ExitFailedError(`Failed to submit PRs`, error);
  }
}

function getBranchBaseName(branch: Branch): string {
  const parent = branch.getParentFromMeta();
  if (parent === undefined) {
    throw new PreconditionsFailedError(
      `Could not find parent for branch ${branch.name} to submit PR against. Please checkout ${branch.name} and run \`gt upstack onto <parent_branch>\` to set its parent.`
    );
  }
  return parent.name;
}

async function getPRCreationInfo(args: {
  branch: Branch;
  parentBranchName: string;
  editPRFieldsInline: boolean;
  createNewPRsAsDraft: boolean | undefined;
  dryRun: boolean;
}): Promise<{
  title: string;
  body: string | undefined;
  draft: boolean;
}> {
  if (args.dryRun) {
    return {
      title: '',
      body: '',
      draft: true,
    };
  }
  logInfo(
    `Enter info for new pull request for ${chalk.yellow(args.branch.name)} ▸ ${
      args.parentBranchName
    }:`
  );

  const title = await getPRTitle({
    branch: args.branch,
    editPRFieldsInline: args.editPRFieldsInline,
  });
  args.branch.setPriorSubmitTitle(title);

  const body = await getPRBody({
    branch: args.branch,
    editPRFieldsInline: args.editPRFieldsInline,
  });
  args.branch.setPriorSubmitBody(body);

  const createAsDraft = await getPRDraftStatus({
    createNewPRsAsDraft: args.createNewPRsAsDraft,
  });

  // Log newline at the end to create some visual separation to the next
  // interactive PR section or status output.
  logNewline();

  return {
    title: title,
    body: body,
    draft: createAsDraft,
  };
}

function printSubmittedPRInfo(prs: TSubmittedPR[]): void {
  if (!prs.length) {
    logNewline();
    logInfo(
      chalk.blueBright('✅ All PRs up-to-date on GitHub; no updates necessary.')
    );
    return;
  }

  prs.forEach((pr) => {
    let status: string = pr.response.status;
    switch (pr.response.status) {
      case 'updated':
        status = chalk.yellow(status);
        break;
      case 'created':
        status = chalk.green(status);
        break;
      case 'error':
        status = chalk.red(status);
        break;
      default:
        assertUnreachable(pr.response);
    }

    if ('error' in pr.response) {
      logError(`Error in submitting ${pr.response.head}: ${pr.response.error}`);
    } else {
      logSuccess(
        `${pr.response.head}: ${chalk.reset(pr.response.prURL)} ${
          '(' + status + ')'
        }`
      );
    }
  });
}

export function saveBranchPRInfo(prs: TSubmittedPR[]): void {
  prs.forEach(async (pr) => {
    if (pr.response.status === 'updated' || pr.response.status === 'created') {
      const branch = await Branch.branchWithName(pr.response.head);
      branch.setPRInfo({
        number: pr.response.prNumber,
        url: pr.response.prURL,
        base: pr.request.base,
      });
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
