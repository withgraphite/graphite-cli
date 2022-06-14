"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPrInfoForBranches = exports.syncPrInfo = void 0;
const pr_info_1 = require("../lib/api/pr_info");
async function syncPrInfo(branchNames, context) {
    const authToken = context.userConfig.data.authToken;
    if (authToken === undefined) {
        return;
    }
    upsertPrInfoForBranches(await (0, pr_info_1.getPrInfoForBranches)(branchNames.map((branchName) => ({
        branchName,
        prNumber: context.metaCache.getPrInfo(branchName)?.number,
    })), {
        authToken,
        repoName: context.repoConfig.getRepoName(),
        repoOwner: context.repoConfig.getRepoOwner(),
    }), context.metaCache);
}
exports.syncPrInfo = syncPrInfo;
function upsertPrInfoForBranches(prInfoToUpsert, metaCache) {
    prInfoToUpsert.forEach((pr) => metaCache.upsertPrInfo(pr.headRefName, {
        number: pr.prNumber,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        reviewDecision: pr.reviewDecision ?? undefined,
        base: pr.baseRefName,
        url: pr.url,
        isDraft: pr.isDraft,
    }));
}
exports.upsertPrInfoForBranches = upsertPrInfoForBranches;
//# sourceMappingURL=sync_pr_info.js.map