#!/usr/bin/env node
import cp from "child_process";
import { syncPRInfoForBranches } from "../../lib/sync/pr_info";
import Branch from "../../wrapper-classes/branch";
import { repoConfig } from "../config";

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
    const branchesWithPRInfo = Branch.allBranches().filter(
      (branch) => branch.getPRInfo() !== undefined
    );
    await syncPRInfoForBranches(branchesWithPRInfo);
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void refreshPRInfo();
}
