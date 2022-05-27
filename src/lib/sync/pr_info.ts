import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../api';
import { TContext } from '../context';

export async function syncPRInfoForBranches(
  branchNames: string[],
  context: TContext
): Promise<void> {
  return syncHelper(
    {
      numbers: branchNames
        .map((branch) => context.metaCache.getPrInfo(branch)?.number)
        .filter((value): value is number => value !== undefined),
    },
    context
  );
}

export async function syncPRInfoForBranchByName(
  branchNames: string[],
  context: TContext
): Promise<void> {
  return syncHelper({ headRefNames: branchNames }, context);
}

async function syncHelper(
  prArgs: { numbers?: number[]; headRefNames?: string[] },
  context: TContext
) {
  const authToken = context.userConfig.data.authToken;
  if (authToken === undefined) {
    return;
  }

  const repoName = context.repoConfig.getRepoName();
  const repoOwner = context.repoConfig.getRepoOwner();

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.pullRequestInfo,
    {
      authToken: authToken,
      repoName: repoName,
      repoOwner: repoOwner,
      prNumbers: prArgs.numbers ?? [],
      prHeadRefNames: prArgs.headRefNames ?? [],
    }
  );

  if (response._response.status === 200) {
    // Note that this currently does not play nicely if the user has a branch
    // that is being merged into multiple other branches; we expect this to
    // be a rare case and will develop it lazily.
    response.prs.forEach((pr) =>
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
}
