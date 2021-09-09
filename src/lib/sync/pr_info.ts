#!/usr/bin/env node
import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import { logError } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";
import { API_SERVER } from "../api";
import { repoConfig, userConfig } from "../config";

/**
 * TODO (nicholasyan): for now, this just syncs info for branches with existing
 * PR info. In the future, we can extend this method to query GitHub for PRs
 * associated with branch heads that don't have associated PR info.
 */
export async function syncPRInfoForBranches(branches: Branch[]): Promise<void> {
  const authToken = userConfig.getAuthToken();
  if (authToken === undefined) {
    return;
  }

  const repoName = repoConfig.getRepoName();
  const repoOwner = repoConfig.getRepoOwner();

  const prNumsToBranches: { [key: number]: Branch } = {};
  branches.forEach((branch) => {
    const prInfo = branch.getPRInfo();
    if (prInfo === undefined) {
      return;
    }
    prNumsToBranches[prInfo.number] = branch;
  });

  const response = await request.requestWithArgs(
    API_SERVER,
    graphiteCLIRoutes.pullRequestInfo,
    {
      authToken: authToken,
      repoName: repoName,
      repoOwner: repoOwner,
      prNumbers: Object.keys(prNumsToBranches).map((num) => parseInt(num)),
    }
  );

  if (response._response.status === 200) {
    await Promise.all(
      response.prs.map(async (pr) => {
        const branch = prNumsToBranches[pr.prNumber];
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
