import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import chalk from 'chalk';
import { API_SERVER } from '../../lib/api';
import { TContext } from '../../lib/context/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { logError, logInfo, logNewline, logSuccess } from '../../lib/utils';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { Branch } from '../../wrapper-classes/branch';
import { TSubmittedPRRequest } from './submit';

type TPRSubmissionInfo = t.UnwrapSchemaMap<
  typeof graphiteCLIRoutes.submitPullRequests.params
>['prs'];

type TSubmittedPRResponse = Unpacked<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>['prs']
>;

type TSubmittedPR = {
  request: TSubmittedPRRequest;
  response: TSubmittedPRResponse;
};

export async function submitPullRequests(
  args: {
    submissionInfoWithBranches: (Unpacked<TPRSubmissionInfo> & {
      branch: Branch;
    })[];
    cliAuthToken: string;
  },
  context: TContext
): Promise<void> {
  logInfo(
    chalk.blueBright(
      `📂 [Step 4] Opening/updating PRs on GitHub for pushed branches...`
    )
  );

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
    if ('error' in pr.response) {
      logError(`Error in submitting ${pr.response.head}: ${pr.response.error}`);
    } else {
      logSuccess(
        `${pr.response.head}: ${chalk.reset(pr.response.prURL)} (${{
          updated: chalk.yellow,
          created: chalk.green,
          error: chalk.red,
        }[pr.response.status](pr.response.status)})`
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
