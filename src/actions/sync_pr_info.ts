import { getPrInfoForBranches, TPRInfoToUpsert } from '../lib/api/pr_info';
import { TContext } from '../lib/context';
import { TMetaCache } from '../lib/engine/cache';

export async function syncPrInfo(
  branchNames: string[],
  context: TContext
): Promise<void> {
  const authToken = context.userConfig.data.authToken;
  if (authToken === undefined) {
    return;
  }

  upsertPrInfoForBranches(
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
    ),
    context.metaCache
  );
}

export function upsertPrInfoForBranches(
  prInfoToUpsert: TPRInfoToUpsert,
  metaCache: TMetaCache
): void {
  prInfoToUpsert.forEach((pr) =>
    metaCache.upsertPrInfo(pr.headRefName, {
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
