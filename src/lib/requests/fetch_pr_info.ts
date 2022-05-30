import { initContext, TContext } from '../context';
import { syncPrInfo } from '../sync/pr_info';
import { spawnDetached } from '../utils/spawn';

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

async function refreshPRInfo(context: TContext): Promise<void> {
  try {
    await syncPrInfo(context.metaCache.allBranchNames, context);
  } catch (err) {
    return;
  }
}

if (process.argv[1] === __filename) {
  void refreshPRInfo(initContext());
}
