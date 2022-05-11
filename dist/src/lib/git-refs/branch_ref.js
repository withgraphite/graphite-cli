"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otherBranchesWithSameCommit = exports.getRef = exports.getBranchToRefMapping = void 0;
const branch_1 = require("../../wrapper-classes/branch");
const cache_1 = require("../config/cache");
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function refreshRefsCache(context) {
    cache_1.cache.clearBranchRefs();
    const memoizedRefToBranches = {};
    const memoizedBranchToRef = {};
    exec_sync_1.gpExecSync({
        command: `git show-ref --heads`,
    })
        .toString()
        .trim()
        .split('\n')
        .filter((line) => line.length > 0)
        .forEach((line) => {
        const pair = line.split(' ');
        if (pair.length !== 2) {
            throw new errors_1.ExitFailedError('Unexpected git ref output');
        }
        const ref = pair[0];
        const branchName = pair[1].replace('refs/heads/', '');
        if (!context.repoConfig.branchIsIgnored(branchName)) {
            memoizedRefToBranches[ref]
                ? memoizedRefToBranches[ref].push(branchName)
                : (memoizedRefToBranches[ref] = [branchName]);
            memoizedBranchToRef[branchName] = ref;
        }
    });
    cache_1.cache.setBranchRefs({
        branchToRef: memoizedBranchToRef,
        refToBranches: memoizedRefToBranches,
    });
}
function getBranchToRefMapping(context) {
    if (!cache_1.cache.getBranchToRef()) {
        refreshRefsCache(context);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache_1.cache.getBranchToRef();
}
exports.getBranchToRefMapping = getBranchToRefMapping;
function getRef(branch, context) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1.cache.getBranchToRef()) {
        refreshRefsCache(context);
    }
    const ref = (_a = cache_1.cache.getBranchToRef()) === null || _a === void 0 ? void 0 : _a[branch.name];
    if (!ref) {
        throw new errors_1.ExitFailedError(`Failed to find ref for ${branch.name}`);
    }
    return ref;
}
exports.getRef = getRef;
function otherBranchesWithSameCommit(branch, context) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1.cache.getRefToBranches()) {
        refreshRefsCache(context);
    }
    const ref = branch.ref(context);
    const branchNames = (_a = cache_1.cache.getRefToBranches()) === null || _a === void 0 ? void 0 : _a[ref];
    if (!branchNames) {
        throw new errors_1.ExitFailedError(`Failed to find branches for ref ${ref}`);
    }
    return branchNames
        .filter((bn) => bn !== branch.name)
        .map((bn) => new branch_1.Branch(bn, {
        useMemoizedResults: branch.shouldUseMemoizedResults,
    }));
}
exports.otherBranchesWithSameCommit = otherBranchesWithSameCommit;
//# sourceMappingURL=branch_ref.js.map