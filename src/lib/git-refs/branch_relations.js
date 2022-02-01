"use strict";
exports.__esModule = true;
exports.getRevListGitTree = exports.getBranchChildrenOrParentsFromGit = void 0;
var chalk_1 = require("chalk");
var branch_1 = require("../../wrapper-classes/branch");
var config_1 = require("../config");
var cache_1 = require("../config/cache");
var telemetry_1 = require("../telemetry");
var utils_1 = require("../utils");
var utils_2 = require("../utils");
var branch_ref_1 = require("./branch_ref");
function getBranchChildrenOrParentsFromGit(branch, opts) {
    var _a;
    var direction = opts.direction;
    var useMemoizedResults = (_a = opts.useMemoizedResults) !== null && _a !== void 0 ? _a : false;
    return telemetry_1.tracer.spanSync({
        name: 'function',
        resource: 'branch.getChildrenOrParents',
        meta: { direction: direction }
    }, function () {
        var gitTree = getRevListGitTree({
            useMemoizedResults: useMemoizedResults,
            direction: opts.direction
        });
        var headSha = branch_ref_1.getRef(branch);
        var childrenOrParents = traverseGitTreeFromCommitUntilBranch(headSha, gitTree, getBranchList({ useMemoizedResult: useMemoizedResults }), 0);
        if (childrenOrParents.shortCircuitedDueToMaxDepth) {
            utils_2.logDebug(chalk_1["default"].magenta("Potential missing branch " + direction.toLocaleLowerCase() + ":") + " Short-circuited search for branch " + chalk_1["default"].bold(branch.name) + "'s " + direction.toLocaleLowerCase() + " due to Graphite 'max-branch-length' setting. (Your Graphite CLI is currently configured to search a max of <" + config_1.repoConfig.getMaxBranchLength() + "> commits away from a branch's tip.) If this is causing an incorrect result (e.g. you know that " + branch.name + " has " + direction.toLocaleLowerCase() + " " + (config_1.repoConfig.getMaxBranchLength() + 1) + " commits away), please adjust the setting using `gt repo max-branch-length`.");
        }
        return Array.from(childrenOrParents.branches).map(function (name) {
            return new branch_1["default"](name, {
                useMemoizedResults: branch.shouldUseMemoizedResults
            });
        });
    });
}
exports.getBranchChildrenOrParentsFromGit = getBranchChildrenOrParentsFromGit;
function getRevListGitTree(opts) {
    var cachedParentsRevList = cache_1["default"].getParentsRevList();
    var cachedChildrenRevList = cache_1["default"].getChildrenRevList();
    if (opts.useMemoizedResults &&
        opts.direction === 'parents' &&
        cachedParentsRevList) {
        return cachedParentsRevList;
    }
    else if (opts.useMemoizedResults &&
        opts.direction === 'children' &&
        cachedChildrenRevList) {
        return cachedChildrenRevList;
    }
    var allBranches = branch_1["default"].allBranches()
        .map(function (b) { return b.name; })
        .join(' ');
    var revList = gitTreeFromRevListOutput(utils_1.gpExecSync({
        command: 
        // Check that there is a commit behind this branch before getting the full list.
        "git rev-list --" + opts.direction + " ^$(git merge-base --octopus " + allBranches + ")~1 " + allBranches + " 2> /dev/null || git rev-list --" + opts.direction + " --all",
        options: {
            maxBuffer: 1024 * 1024 * 1024
        }
    })
        .toString()
        .trim());
    if (opts.direction === 'parents') {
        cache_1["default"].setParentsRevList(revList);
    }
    else if (opts.direction === 'children') {
        cache_1["default"].setChildrenRevList(revList);
    }
    return revList;
}
exports.getRevListGitTree = getRevListGitTree;
var memoizedBranchList;
function getBranchList(opts) {
    if (opts.useMemoizedResult && memoizedBranchList !== undefined) {
        return memoizedBranchList;
    }
    memoizedBranchList = branchListFromShowRefOutput(utils_1.gpExecSync({
        command: 'git show-ref --heads',
        options: { maxBuffer: 1024 * 1024 * 1024 }
    })
        .toString()
        .trim());
    return memoizedBranchList;
}
function traverseGitTreeFromCommitUntilBranch(commit, gitTree, branchList, n) {
    // Skip the first iteration b/c that is the CURRENT branch
    if (n > 0 && commit in branchList) {
        return {
            branches: new Set(branchList[commit])
        };
    }
    // Limit the search
    var maxBranchLength = config_1.repoConfig.getMaxBranchLength();
    if (n > maxBranchLength) {
        return {
            branches: new Set(),
            shortCircuitedDueToMaxDepth: true
        };
    }
    if (!gitTree[commit] || gitTree[commit].length == 0) {
        return {
            branches: new Set()
        };
    }
    var commitsMatchingBranches = new Set();
    var shortCircuitedDueToMaxDepth = undefined;
    for (var _i = 0, _a = gitTree[commit]; _i < _a.length; _i++) {
        var neighborCommit = _a[_i];
        var results = traverseGitTreeFromCommitUntilBranch(neighborCommit, gitTree, branchList, n + 1);
        var branches = results.branches;
        shortCircuitedDueToMaxDepth =
            results.shortCircuitedDueToMaxDepth || shortCircuitedDueToMaxDepth;
        if (branches.size !== 0) {
            branches.forEach(function (commit) {
                commitsMatchingBranches.add(commit);
            });
        }
    }
    return {
        branches: commitsMatchingBranches,
        shortCircuitedDueToMaxDepth: shortCircuitedDueToMaxDepth
    };
}
function branchListFromShowRefOutput(output) {
    var ret = {};
    for (var _i = 0, _a = output.split('\n'); _i < _a.length; _i++) {
        var line = _a[_i];
        if (line.length > 0) {
            var parts = line.split(' ');
            var branchName = parts[1].slice('refs/heads/'.length);
            var branchRef = parts[0];
            if (!config_1.repoConfig.branchIsIgnored(branchName)) {
                utils_2.logDebug("branch " + branchName + " is not ignored");
                if (branchRef in ret) {
                    ret[branchRef].push(branchName);
                }
                else {
                    ret[branchRef] = [branchName];
                }
            }
        }
    }
    return ret;
}
function gitTreeFromRevListOutput(output) {
    var ret = {};
    for (var _i = 0, _a = output.split('\n'); _i < _a.length; _i++) {
        var line = _a[_i];
        if (line.length > 0) {
            var shas = line.split(' ');
            ret[shas[0]] = shas.slice(1);
        }
    }
    return ret;
}
