#!/usr/bin/env node
import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import { request } from "@screenplaydev/retyped-routes";
import cp from "child_process";
import Branch from "../../wrapper-classes/branch";
import { API_SERVER } from "../api";
import { repoConfig, userConfig } from "../config";

export function refreshPRInfoInBackground(): void {
  // do our potential write before we kick off the child process so that we
  // don't incur a possible race condition with the write
  const now = Date.now();
  const lastFetchedMs = repoConfig.getLastFetchedPRInfoMs();
  const msInSecond = 1000;

  // rate limit refreshing PR info to once per minute
  if (lastFetchedMs === undefined || now - lastFetchedMs > 60 * msInSecond) {
    repoConfig.setLastFetchedPRInfoMs(now);
    cp.spawn("/usr/bin/env", ["node", __filename], {
      detached: true,
      stdio: "ignore",
    });
  }
}

async function refreshPRInfo(): Promise<void> {
  try {
    const authToken = userConfig.getAuthToken();
    if (authToken === undefined) {
      return;
    }

    const repoName = repoConfig.getRepoName();
    const repoOwner = repoConfig.getRepoOwner();

    const branchesWithPRs = Branch.allBranches().filter(
      (branch) => branch.getPRInfo() !== undefined
    );
    const prNumsToBranches: { [prNum: number]: Branch } = {};
    branchesWithPRs.forEach(
      (branchWithPR) =>
        (prNumsToBranches[branchWithPR.getPRInfo()!.number] = branchWithPR)
    );
    const prNums = Object.keys(prNumsToBranches).map((prNumKey) =>
      parseInt(prNumKey)
    );

    const response = await request.requestWithArgs(
      API_SERVER,
      graphiteCLIRoutes.pullRequestInfo,
      {
        authToken: authToken,
        repoName: repoName,
        repoOwner: repoOwner,
        prNumbers: prNums,
      }
    );

    if (response._response.status === 200) {
      response.prs.forEach((pr) => {
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
      });
    }
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void refreshPRInfo();
}
