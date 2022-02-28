import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import { logError } from '../../lib/utils';
import { Branch } from '../../wrapper-classes/branch';
import { API_SERVER } from '../api';
import { TContext } from './../context/context';

/**
 * TODO (nicholasyan): for now, this just syncs info for branches with existing
 * PR info. In the future, we can extend this method to query GitHub for PRs
 * associated with branch heads that don't have associated PR info.
 */
export async function syncPRInfoForBranches(
  branches: Branch[],
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
      prNumbers: [],
      prHeadRefNames: branches
        .filter((branch) => !branch.isTrunk(context))
        .map((branch) => branch.name),
    }
  );

  if (response._response.status === 200) {
    // Note that this currently does not play nicely if the user has a branch
    // that is being merged into multiple other branches; we expect this to
    // be a rare case and will develop it lazily.
    await Promise.all(
      response.prs.map(async (pr) => {
        const branch = await Branch.branchWithName(pr.headRefName, context);
        branch.setPRInfo({
          number: pr.prNumber,
          base: pr.baseRefName,
          url: pr.url,
          state: pr.state,
          title: pr.title,
          reviewDecision: pr.reviewDecision ?? undefined,
          isDraft: pr.isDraft,
        });

        if (branch.name !== pr.headRefName) {
          logError(
            `PR ${pr.prNumber} is associated with ${pr.headRefName} on GitHub, but branch ${branch.name} locally. Please rename the local branch (\`gt branch rename\`) to match the remote branch associated with the PR. (While ${branch.name} is misaligned with GitHub, you cannot use \`gt submit\` on it.)`
          );
        }
      })
    );
  }
}
