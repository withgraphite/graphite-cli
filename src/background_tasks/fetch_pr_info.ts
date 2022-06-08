import { getPrInfoForBranches } from '../lib/api/pr_info';
import { prInfoConfigFactory } from '../lib/config/pr_info_config';
import { repoConfigFactory } from '../lib/config/repo_config';
import { userConfigFactory } from '../lib/config/user_config';
import { TContext } from '../lib/context';
import {
  getMetadataRefList,
  readMetadataRef,
} from '../lib/engine/metadata_ref';
import { spawnDetached } from '../lib/utils/spawn';

export function refreshPRInfoInBackground(context: TContext): void {
  if (!context.repoConfig.graphiteInitialized()) {
    return;
  }

  const now = Date.now();
  const lastFetchedMs = context.repoConfig.data.lastFetchedPRInfoMs;
  const msInSecond = 1000;

  // rate limit refreshing PR info to once per minute
  if (lastFetchedMs === undefined || now - lastFetchedMs > 60 * msInSecond) {
    // do our potential write before we kick off the child process so that we
    // don't incur a possible race condition with the write
    context.repoConfig.update((data) => (data.lastFetchedPRInfoMs = now));

    spawnDetached(__filename);
  }
}

async function refreshPRInfo(): Promise<void> {
  try {
    const userConfig = userConfigFactory.load();
    if (!userConfig.data.authToken) {
      return;
    }
    const repoConfig = repoConfigFactory.load();
    if (!repoConfig.data.name || !repoConfig.data.owner) {
      return;
    }
    const branchNamesWithExistingPrNumbers = Object.keys(
      getMetadataRefList()
    ).map((branchName) => ({
      branchName,
      prNumber: readMetadataRef(branchName)?.prInfo?.number,
    }));
    const prInfoToUpsert = await getPrInfoForBranches(
      branchNamesWithExistingPrNumbers,
      {
        authToken: userConfig.data.authToken,
        repoName: repoConfig.data.name,
        repoOwner: repoConfig.data.owner,
      }
    );

    prInfoConfigFactory
      .loadIfExists()
      ?.update((data) => (data.prInfoToUpsert = prInfoToUpsert));
  } catch (err) {
    prInfoConfigFactory.load().delete();
  }
}

if (process.argv[1] === __filename) {
  void refreshPRInfo();
}
