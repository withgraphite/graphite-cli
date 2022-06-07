import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import * as t from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import chalk from 'chalk';
import { API_SERVER } from '../../lib/api';
import { TContext } from '../../lib/context';
import { ExitFailedError, PreconditionsFailedError } from '../../lib/errors';
import { cuteString } from '../../lib/utils/cute_string';
import { Unpacked } from '../../lib/utils/ts_helpers';
import { TSubmittedPRRequest } from './submit_action';

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

export async function submitPullRequest(
  args: {
    submissionInfo: TPRSubmissionInfo;
    cliAuthToken: string;
  },
  context: TContext
): Promise<void> {
  const { errorMessage } = handlePRReponse(
    (
      await requestServerToSubmitPRs(
        args.cliAuthToken,
        args.submissionInfo,
        context
      )
    )[0],
    context
  );
  if (errorMessage) {
    throw new ExitFailedError(errorMessage);
  }
}

const SUCCESS_RESPONSE_CODE = 200;
const UNAUTHORIZED_RESPONSE_CODE = 401;

// This endpoint is plural for legacy reasons.
// Leaving the function plural in case we want to revert.
export async function requestServerToSubmitPRs(
  cliAuthToken: string,
  submissionInfo: TPRSubmissionInfo,
  context: TContext
): Promise<TSubmittedPR[]> {
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
        }).\n\nResponse: ${cuteString(response)}`
      );
    }
  } catch (error) {
    throw new ExitFailedError(
      `Failed to submit PR${submissionInfo.length > 1 ? 's' : ''}`,
      error
    );
  }
}

export function handlePRReponse(
  pr: TSubmittedPR,
  context: TContext
): { errorMessage?: string } {
  if (pr.response.status === 'error') {
    return {
      errorMessage: `Error in submitting ${pr.response.head}: ${pr.response.error}`,
    };
  }

  context.metaCache.upsertPrInfo(pr.response.head, {
    number: pr.response.prNumber,
    url: pr.response.prURL,
    base: pr.request.base,
    state: 'OPEN', // We know this is not closed or merged because submit succeeded
    ...(pr.request.action === 'create'
      ? {
          title: pr.request.title,
          body: pr.request.body,
          reviewDecision: 'REVIEW_REQUIRED', // Because we just opened this PR
        }
      : {}),
    ...(pr.request.draft !== undefined ? { draft: pr.request.draft } : {}),
  });
  context.splog.logInfo(
    `${chalk.green(pr.response.head)}: ${pr.response.prURL} (${{
      updated: chalk.yellow,
      created: chalk.green,
    }[pr.response.status](pr.response.status)})`
  );
  return {};
}
