import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../api';
import { TContext } from '../context';
import { TBranchPRInfo } from '../engine/metadata_ref';

export async function syncPRInfoForBranches(
  branchNames: string[],
  context: TContext
): Promise<void> {
  const authToken = context.userConfig.data.authToken;
  if (authToken === undefined) {
    return;
  }

  const branchesWithoutPrInfo = new Set<string>();
  const existingPrInfo = new Map<
    number,
    TBranchPRInfo & { branchName: string }
  >();

  branchNames.forEach((branchName) => {
    const prInfo = context.metaCache.getPrInfo(branchName);

    if (prInfo?.number === undefined) {
      branchesWithoutPrInfo.add(branchName);
    } else {
      existingPrInfo.set(prInfo.number, {
        ...prInfo,
        branchName: branchName,
      });
    }
  });

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.pullRequestInfo,
    {
      authToken: authToken,
      repoName: context.repoConfig.getRepoName(),
      repoOwner: context.repoConfig.getRepoOwner(),
      prNumbers: [...existingPrInfo.keys()],
      // For branches that are not already associated with a PR, fetch by branch name.
      prHeadRefNames: [...branchesWithoutPrInfo],
    }
  );

  if (response._response.status !== 200) {
    return;
  }

  response.prs
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
    .forEach((pr) =>
      context.metaCache.upsertPrInfo(pr.headRefName, {
        number: pr.prNumber,
        base: pr.baseRefName,
        url: pr.url,
        state: pr.state,
        title: pr.title,
        reviewDecision: pr.reviewDecision ?? undefined,
        isDraft: pr.isDraft,
      })
    );
}
