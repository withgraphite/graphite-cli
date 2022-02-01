"use strict";
exports.__esModule = true;
exports.otherBranchesWithSameCommit = exports.getRef = exports.getBranchToRefMapping = void 0;
var branch_1 = require("../../wrapper-classes/branch");
var config_1 = require("../config");
var cache_1 = require("../config/cache");
var errors_1 = require("../errors");
var utils_1 = require("../utils");
function refreshRefsCache() {
    cache_1["default"].clearBranchRefs();
    var memoizedRefToBranches = {};
    var memoizedBranchToRef = {};
    utils_1.gpExecSync({
        command: "git show-ref --heads"
    })
        .toString()
        .trim()
        .split('\n')
        .filter(function (line) { return line.length > 0; })
        .forEach(function (line) {
        var pair = line.split(' ');
        if (pair.length !== 2) {
            throw new errors_1.ExitFailedError('Unexpected git ref output');
        }
        var ref = pair[0];
        var branchName = pair[1].replace('refs/heads/', '');
        if (!config_1.repoConfig.branchIsIgnored(branchName)) {
            memoizedRefToBranches[ref]
                ? memoizedRefToBranches[ref].push(branchName)
                : (memoizedRefToBranches[ref] = [branchName]);
            memoizedBranchToRef[branchName] = ref;
        }
    });
    cache_1["default"].setBranchRefs({
        branchToRef: memoizedBranchToRef,
        refToBranches: memoizedRefToBranches
    });
}
function getBranchToRefMapping() {
    if (!cache_1["default"].getBranchToRef()) {
        refreshRefsCache();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache_1["default"].getBranchToRef();
}
exports.getBranchToRefMapping = getBranchToRefMapping;
function getRef(branch) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1["default"].getBranchToRef()) {
        refreshRefsCache();
    }
    var ref = (_a = cache_1["default"].getBranchToRef()) === null || _a === void 0 ? void 0 : _a[branch.name];
    if (!ref) {
        throw new errors_1.ExitFailedError("Failed to find ref for " + branch.name);
    }
    return ref;
}
exports.getRef = getRef;
function otherBranchesWithSameCommit(branch) {
    var _a;
    if (!branch.shouldUseMemoizedResults || !cache_1["default"].getRefToBranches()) {
        refreshRefsCache();
    }
    var ref = branch.ref();
    var branchNames = (_a = cache_1["default"].getRefToBranches()) === null || _a === void 0 ? void 0 : _a[ref];
    if (!branchNames) {
        throw new errors_1.ExitFailedError("Failed to find branches for ref " + ref);
    }
    return branchNames
        .filter(function (bn) { return bn !== branch.name; })
        .map(function (bn) {
        return new branch_1["default"](bn, {
            useMemoizedResults: branch.shouldUseMemoizedResults
        });
    });
}
exports.otherBranchesWithSameCommit = otherBranchesWithSameCommit;
