"use strict";
exports.__esModule = true;
exports.getTrunk = exports.inferTrunk = void 0;
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var branch_1 = require("../../wrapper-classes/branch");
var config_1 = require("../config");
var errors_1 = require("../errors");
function findRemoteOriginBranch() {
    var config;
    try {
        var gitDir = child_process_1.execSync("git rev-parse --git-dir").toString().trim();
        config = fs_extra_1["default"].readFileSync(path_1["default"].join(gitDir, 'config')).toString();
    }
    catch (_a) {
        throw new Error("Failed to read .git config when determining trunk branch");
    }
    var originBranchSections = config
        .split('[')
        .filter(function (section) {
        return section.includes('branch "') && section.includes('remote = origin');
    });
    if (originBranchSections.length !== 1) {
        return undefined;
    }
    try {
        var matches = originBranchSections[0].match(/branch "(.+)"\]/);
        if (matches && matches.length == 1) {
            return new branch_1["default"](matches[0]);
        }
    }
    catch (_b) {
        return undefined;
    }
    return undefined;
}
function findCommonlyNamedTrunk() {
    var potentialTrunks = branch_1["default"].allBranches().filter(function (b) {
        return ['main', 'master', 'development', 'develop'].includes(b.name);
    });
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    return undefined;
}
var memoizedTrunk;
function inferTrunk() {
    return findRemoteOriginBranch() || findCommonlyNamedTrunk();
}
exports.inferTrunk = inferTrunk;
function getTrunk() {
    if (memoizedTrunk) {
        return memoizedTrunk;
    }
    var configTrunkName = config_1.repoConfig.getTrunk();
    if (configTrunkName) {
        if (!branch_1["default"].exists(configTrunkName)) {
            throw new errors_1.ExitFailedError("Configured trunk branch (" + configTrunkName + ") not found in the current repo. Consider updating the trunk name by running \"gt repo init\".");
        }
        memoizedTrunk = new branch_1["default"](configTrunkName, { useMemoizedResults: true });
    }
    // No configured trunk, infer
    if (!memoizedTrunk) {
        var inferredTrunk = inferTrunk();
        if (inferredTrunk) {
            memoizedTrunk = inferredTrunk.useMemoizedResults();
            return memoizedTrunk;
        }
        throw new errors_1.ConfigError("No configured trunk branch, and unable to infer. Consider setting the trunk name by running \"gt repo init\".");
    }
    var trunkSiblings = memoizedTrunk.branchesWithSameCommit();
    if (trunkSiblings.length > 0) {
        throw new errors_1.SiblingBranchError([memoizedTrunk].concat(trunkSiblings));
    }
    return memoizedTrunk;
}
exports.getTrunk = getTrunk;
