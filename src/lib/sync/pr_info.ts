import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { API_SERVER } from '../api';
import { TContext } from '../context';

export async function syncPRInfoForBranches(
  branchNames: string[],
  context: TContext
): Promise<void> {
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
      prNumbers: branchNames
        .map((branch) => context.metaCache.getPrInfo(branch)?.number)
        .filter((value): value is number => value !== undefined),
      // For branches that are not already associated with a PR, fetch by branch name.
      prHeadRefNames: branchNames.filter(
        (branch) => !context.metaCache.getPrInfo(branch)?.number === undefined
      ),
    }
  );

  if (response._response.status === 200) {
    // Note that this currently does not play nicely if the user has a branch
    // that is being merged into multiple other branches; we expect this to
    // be a rare case and will develop it lazily.
    response.prs
      .filter(
        (pr) =>
          // If the PR is not open, don't newly associate it with a branch.
          pr.state === 'OPEN' ||
          context.metaCache.getPrInfo(pr.headRefName)?.number !== undefined
      )
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
}
