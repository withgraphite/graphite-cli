import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import t from '@withgraphite/retype';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from './server';

type TBranchNameWithPrNumber = {
  branchName: string;
  prNumber: number | undefined;
};

export async function getPrInfoForBranches(
  branchNamesWithExistingPrInfo: TBranchNameWithPrNumber[],
  params: {
    authToken: string;
    repoName: string;
    repoOwner: string;
  }
): Promise<
  t.UnwrapSchemaMap<typeof graphiteCLIRoutes.pullRequestInfo.response>['prs']
> {
  // We sync branches without existing PR info by name.  For branches
  // that are already associated with a PR, we only sync if both the
  // the associated PR (keyed by number) if the name matches the headRef.

  const branchesWithoutPrInfo = new Set<string>();
  const existingPrInfo = new Map<number, string>();

  branchNamesWithExistingPrInfo.forEach((branch) => {
    if (branch?.prNumber === undefined) {
      branchesWithoutPrInfo.add(branch.branchName);
    } else {
      existingPrInfo.set(branch.prNumber, branch.branchName);
    }
  });

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.pullRequestInfo,
    {
      ...params,
      prNumbers: [...existingPrInfo.keys()],
      prHeadRefNames: [...branchesWithoutPrInfo],
    }
  );

  if (response._response.status !== 200) {
    return [];
  }

  return response.prs.filter((pr) => {
    const branchNameIfAssociated = existingPrInfo.get(pr.prNumber);

    const shouldAssociatePrWithBranch =
      !branchNameIfAssociated &&
      pr.state === 'OPEN' &&
      branchesWithoutPrInfo.has(pr.headRefName);

    const shouldUpdateExistingBranch =
      branchNameIfAssociated === pr.headRefName;

    return shouldAssociatePrWithBranch || shouldUpdateExistingBranch;
  });
}
