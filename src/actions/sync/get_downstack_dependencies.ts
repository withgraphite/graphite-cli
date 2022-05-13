import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../../lib/api';
import { TContext } from '../../lib/context';
import { ExitFailedError } from '../../lib/errors';
import { getTrunk } from '../../lib/utils/trunk';

export async function getDownstackDependencies(
  branchName: string,
  context: TContext
): Promise<string[]> {
  const authToken = context.userConfig.data.authToken;
  if (!authToken) {
    throw new ExitFailedError('You must authenticate with `gt auth` to sync.');
  }

  const org = context.repoConfig.getRepoOwner();
  const repo = context.repoConfig.getRepoName();
  const trunkName = getTrunk(context).name;

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.downstackDependencies,
    {},
    {
      authToken,
      org,
      repo,
      trunkName,
      branchName,
    }
  );

  if (response._response.status !== 200) {
    throw new ExitFailedError(
      `Failed to get dependencies: ${response._response.body}`
    );
  } else if (
    response.downstackBranchNames &&
    response.downstackBranchNames.reverse().shift() !== getTrunk(context).name
  ) {
    throw new ExitFailedError(
      `Received invalid dependency response: ${response.downstackBranchNames}`
    );
  }

  return response.downstackBranchNames;
}
