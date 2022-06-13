"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshPRInfoInBackground = void 0;
const pr_info_1 = require("../lib/api/pr_info");
const pr_info_config_1 = require("../lib/config/pr_info_config");
const repo_config_1 = require("../lib/config/repo_config");
const user_config_1 = require("../lib/config/user_config");
const metadata_ref_1 = require("../lib/engine/metadata_ref");
const spawn_1 = require("../lib/utils/spawn");
function refreshPRInfoInBackground(context) {
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
        (0, spawn_1.spawnDetached)(__filename);
    }
}
exports.refreshPRInfoInBackground = refreshPRInfoInBackground;
async function refreshPRInfo() {
    try {
        const userConfig = user_config_1.userConfigFactory.load();
        if (!userConfig.data.authToken) {
            return;
        }
        const repoConfig = repo_config_1.repoConfigFactory.load();
        if (!repoConfig.data.name || !repoConfig.data.owner) {
            return;
        }
        const branchNamesWithExistingPrNumbers = Object.keys((0, metadata_ref_1.getMetadataRefList)()).map((branchName) => ({
            branchName,
            prNumber: (0, metadata_ref_1.readMetadataRef)(branchName)?.prInfo?.number,
        }));
        const prInfoToUpsert = await (0, pr_info_1.getPrInfoForBranches)(branchNamesWithExistingPrNumbers, {
            authToken: userConfig.data.authToken,
            repoName: repoConfig.data.name,
            repoOwner: repoConfig.data.owner,
        });
        pr_info_config_1.prInfoConfigFactory
            .loadIfExists()
            ?.update((data) => (data.prInfoToUpsert = prInfoToUpsert));
    }
    catch (err) {
        pr_info_config_1.prInfoConfigFactory.load().delete();
    }
}
if (process.argv[1] === __filename) {
    void refreshPRInfo();
}
//# sourceMappingURL=fetch_pr_info.js.map