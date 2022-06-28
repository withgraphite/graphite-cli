import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { ExitFailedError } from '../errors';
import { TRepoParams } from './common_params';
import { API_SERVER } from './server';

export async function getDownstackDependencies(
  args: { branchName: string; trunkName: string },
  params: TRepoParams
): Promise<string[]> {
  const response = await request.requestWithArgs(
    API_SERVER,
    API_ROUTES.downstackDependencies,
    {},
    {
      authToken: params.authToken,
      org: params.repoOwner,
      repo: params.repoName,
      trunkName: args.trunkName,
      branchName: args.branchName,
    }
  );

  if (response._response.status !== 200) {
    throw new ExitFailedError(
      `Failed to get dependencies: ${response._response.body}`
    );
  }

  // We want to validate that the top branch is the one we asked for and
  // that the bottom is trunk.
  const topReturnedBranch = response.downstackBranchNames[0];
  // We remove trunk from the list (it doesn't need any action)
  // We reverse the list in place so that we can merge from the bottom up
  const bottomReturnedBranch = response.downstackBranchNames.reverse().shift();

  if (
    topReturnedBranch !== args.branchName ||
    bottomReturnedBranch !== args.trunkName
  ) {
    throw new ExitFailedError(
      `Received invalid dependency response: ${response.downstackBranchNames}`
    );
  }

  return response.downstackBranchNames;
}
