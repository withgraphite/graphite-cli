import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../api';
import { TContext } from '../context';
import { TBranchPRInfo } from '../engine/metadata_ref';

export async function syncPrInfo(
  branchNames: string[],
  context: TContext
): Promise<void> {
  const authToken = context.userConfig.data.authToken;
  if (authToken === undefined) {
    return;
  }

  const branchNamesWithExistingPrInfo = branchNames.map((branchName) => ({
    branchName,
    prInfo: context.metaCache.getPrInfo(branchName),
  }));

  (
    await getPrInfoForBranches(branchNamesWithExistingPrInfo, {
      authToken,
      repoName: context.repoConfig.getRepoName(),
      repoOwner: context.repoConfig.getRepoOwner(),
    })
  ).forEach(
    (branch) =>
      branch.prInfo &&
      context.metaCache.upsertPrInfo(branch.branchName, branch.prInfo)
  );
}

type TBranchNameWithPrInfo = {
  branchName: string;
  prInfo: TBranchPRInfo | undefined;
};

export async function getPrInfoForBranches(
  branchNamesWithExistingPrInfo: TBranchNameWithPrInfo[],
  params: {
    authToken: string;
    repoName: string;
    repoOwner: string;
  }
): Promise<TBranchNameWithPrInfo[]> {
  // We sync branches without existing PR info by name.  For branches
  // that are already associated with a PR, we only sync if both the
  // the associated PR (keyed by number) if the name matches the headRef.

  const branchesWithoutPrInfo = new Set<string>();
  const existingPrInfo = new Map<
    number,
    TBranchPRInfo & { branchName: string }
  >();

  branchNamesWithExistingPrInfo.forEach((branch) => {
    if (branch.prInfo?.number === undefined) {
      branchesWithoutPrInfo.add(branch.branchName);
    } else {
      existingPrInfo.set(branch.prInfo.number, {
        ...branch.prInfo,
        branchName: branch.branchName,
      });
    }
  });

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.pullRequestInfo,
    {
      ...params,
      prNumbers: [...existingPrInfo.keys()],
      // For branches that are not already associated with a PR, fetch by branch name.
      prHeadRefNames: [...branchesWithoutPrInfo],
    }
  );

  if (response._response.status !== 200) {
    return [];
  }

  return response.prs
    .filter((pr) => {
      const existingInfoForPr = existingPrInfo.get(pr.prNumber);

      const shouldUpdateExistingBranch =
        existingInfoForPr?.branchName === pr.headRefName;

      const shouldAssociatePrWithBranch =
        !existingInfoForPr &&
        pr.state === 'OPEN' &&
        branchesWithoutPrInfo.has(pr.headRefName);

      return shouldAssociatePrWithBranch || shouldUpdateExistingBranch;
    })
    .map((pr) => ({
      branchName: pr.headRefName,
      prInfo: {
        number: pr.prNumber,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        reviewDecision: pr.reviewDecision ?? undefined,
        base: pr.baseRefName,
        url: pr.url,
        isDraft: pr.isDraft,
      },
    }));
}
