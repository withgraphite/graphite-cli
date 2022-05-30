import { getPrInfoForBranches } from '../lib/api/pr_info';
import { TContext } from '../lib/context';

export async function syncPrInfo(
  branchNames: string[],
  context: TContext
): Promise<void> {
  const authToken = context.userConfig.data.authToken;
  if (authToken === undefined) {
    return;
  }

  (
    await getPrInfoForBranches(
      branchNames.map((branchName) => ({
        branchName,
        prNumber: context.metaCache.getPrInfo(branchName)?.number,
      })),
      {
        authToken,
        repoName: context.repoConfig.getRepoName(),
        repoOwner: context.repoConfig.getRepoOwner(),
      }
    )
  ).forEach((pr) =>
    context.metaCache.upsertPrInfo(pr.headRefName, {
      number: pr.prNumber,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      reviewDecision: pr.reviewDecision ?? undefined,
      base: pr.baseRefName,
      url: pr.url,
      isDraft: pr.isDraft,
    })
  );
}
