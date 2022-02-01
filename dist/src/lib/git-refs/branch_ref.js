"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otherBranchesWithSameCommit = exports.getRef = exports.getBranchToRefMapping = void 0;
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const config_1 = require("../config");
const cache_1 = __importDefault(require("../config/cache"));
const errors_1 = require("../errors");
const utils_1 = require("../utils");
function refreshRefsCache() {
    cache_1.default.clearBranchRefs();
    const memoizedRefToBranches = {};
    const memoizedBranchToRef = {};
    (0, utils_1.gpExecSync)({
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
        if (!config_1.repoConfig.branchIsIgnored(branchName)) {
            memoizedRefToBranches[ref]
                ? memoizedRefToBranches[ref].push(branchName)
                : (memoizedRefToBranches[ref] = [branchName]);
            memoizedBranchToRef[branchName] = ref;
        }
    });
    cache_1.default.setBranchRefs({
        branchToRef: memoizedBranchToRef,
        refToBranches: memoizedRefToBranches,
    });
}
function getBranchToRefMapping() {
    if (!cache_1.default.getBranchToRef()) {
        refreshRefsCache();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache_1.default.getBranchToRef();
}
exports.getBranchToRefMapping = getBranchToRefMapping;
function getRef(branch) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1.default.getBranchToRef()) {
        refreshRefsCache();
    }
    const ref = (_a = cache_1.default.getBranchToRef()) === null || _a === void 0 ? void 0 : _a[branch.name];
    if (!ref) {
        throw new errors_1.ExitFailedError(`Failed to find ref for ${branch.name}`);
    }
    return ref;
}
exports.getRef = getRef;
function otherBranchesWithSameCommit(branch) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1.default.getRefToBranches()) {
        refreshRefsCache();
    }
    const ref = branch.ref();
    const branchNames = (_a = cache_1.default.getRefToBranches()) === null || _a === void 0 ? void 0 : _a[ref];
    if (!branchNames) {
        throw new errors_1.ExitFailedError(`Failed to find branches for ref ${ref}`);
    }
    return branchNames
        .filter((bn) => bn !== branch.name)
        .map((bn) => new branch_1.default(bn, {
        useMemoizedResults: branch.shouldUseMemoizedResults,
    }));
}
exports.otherBranchesWithSameCommit = otherBranchesWithSameCommit;
//# sourceMappingURL=branch_ref.js.map