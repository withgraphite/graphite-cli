"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevListGitTree = exports.getBranchChildrenOrParentsFromGit = void 0;
const chalk_1 = __importDefault(require("chalk"));
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const config_1 = require("../config");
const cache_1 = __importDefault(require("../config/cache"));
const telemetry_1 = require("../telemetry");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
const branch_ref_1 = require("./branch_ref");
function getBranchChildrenOrParentsFromGit(branch, opts) {
    var _a;
    const direction = opts.direction;
    const useMemoizedResults = (_a = opts.useMemoizedResults) !== null && _a !== void 0 ? _a : false;
    return telemetry_1.tracer.spanSync({
        name: 'function',
        resource: 'branch.getChildrenOrParents',
        meta: { direction: direction },
    }, () => {
        const gitTree = getRevListGitTree({
            useMemoizedResults,
            direction: opts.direction,
        });
        const headSha = (0, branch_ref_1.getRef)(branch);
        const childrenOrParents = traverseGitTreeFromCommitUntilBranch(headSha, gitTree, getBranchList({ useMemoizedResult: useMemoizedResults }), 0);
        if (childrenOrParents.shortCircuitedDueToMaxDepth) {
            (0, utils_2.logDebug)(`${chalk_1.default.magenta(`Potential missing branch ${direction.toLocaleLowerCase()}:`)} Short-circuited search for branch ${chalk_1.default.bold(branch.name)}'s ${direction.toLocaleLowerCase()} due to Graphite 'max-branch-length' setting. (Your Graphite CLI is currently configured to search a max of <${config_1.repoConfig.getMaxBranchLength()}> commits away from a branch's tip.) If this is causing an incorrect result (e.g. you know that ${branch.name} has ${direction.toLocaleLowerCase()} ${config_1.repoConfig.getMaxBranchLength() + 1} commits away), please adjust the setting using \`gt repo max-branch-length\`.`);
        }
        return Array.from(childrenOrParents.branches).map((name) => new branch_1.default(name, {
            useMemoizedResults: branch.shouldUseMemoizedResults,
        }));
    });
}
exports.getBranchChildrenOrParentsFromGit = getBranchChildrenOrParentsFromGit;
function getRevListGitTree(opts) {
    const cachedParentsRevList = cache_1.default.getParentsRevList();
    const cachedChildrenRevList = cache_1.default.getChildrenRevList();
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
    const allBranches = branch_1.default.allBranches()
        .map((b) => b.name)
        .join(' ');
    const revList = gitTreeFromRevListOutput((0, utils_1.gpExecSync)({
        command: 
        // Check that there is a commit behind this branch before getting the full list.
        `git rev-list --${opts.direction} ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --${opts.direction} --all`,
        options: {
            maxBuffer: 1024 * 1024 * 1024,
        },
    })
        .toString()
        .trim());
    if (opts.direction === 'parents') {
        cache_1.default.setParentsRevList(revList);
    }
    else if (opts.direction === 'children') {
        cache_1.default.setChildrenRevList(revList);
    }
    return revList;
}
exports.getRevListGitTree = getRevListGitTree;
let memoizedBranchList;
function getBranchList(opts) {
    if (opts.useMemoizedResult && memoizedBranchList !== undefined) {
        return memoizedBranchList;
    }
    memoizedBranchList = branchListFromShowRefOutput((0, utils_1.gpExecSync)({
        command: 'git show-ref --heads',
        options: { maxBuffer: 1024 * 1024 * 1024 },
    })
        .toString()
        .trim());
    return memoizedBranchList;
}
function traverseGitTreeFromCommitUntilBranch(commit, gitTree, branchList, n) {
    // Skip the first iteration b/c that is the CURRENT branch
    if (n > 0 && commit in branchList) {
        return {
            branches: new Set(branchList[commit]),
        };
    }
    // Limit the search
    const maxBranchLength = config_1.repoConfig.getMaxBranchLength();
    if (n > maxBranchLength) {
        return {
            branches: new Set(),
            shortCircuitedDueToMaxDepth: true,
        };
    }
    if (!gitTree[commit] || gitTree[commit].length == 0) {
        return {
            branches: new Set(),
        };
    }
    const commitsMatchingBranches = new Set();
    let shortCircuitedDueToMaxDepth = undefined;
    for (const neighborCommit of gitTree[commit]) {
        const results = traverseGitTreeFromCommitUntilBranch(neighborCommit, gitTree, branchList, n + 1);
        const branches = results.branches;
        shortCircuitedDueToMaxDepth =
            results.shortCircuitedDueToMaxDepth || shortCircuitedDueToMaxDepth;
        if (branches.size !== 0) {
            branches.forEach((commit) => {
                commitsMatchingBranches.add(commit);
            });
        }
    }
    return {
        branches: commitsMatchingBranches,
        shortCircuitedDueToMaxDepth: shortCircuitedDueToMaxDepth,
    };
}
function branchListFromShowRefOutput(output) {
    const ret = {};
    for (const line of output.split('\n')) {
        if (line.length > 0) {
            const parts = line.split(' ');
            const branchName = parts[1].slice('refs/heads/'.length);
            const branchRef = parts[0];
            if (!config_1.repoConfig.branchIsIgnored(branchName)) {
                (0, utils_2.logDebug)(`branch ${branchName} is not ignored`);
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
    const ret = {};
    for (const line of output.split('\n')) {
        if (line.length > 0) {
            const shas = line.split(' ');
            ret[shas[0]] = shas.slice(1);
        }
    }
    return ret;
}
//# sourceMappingURL=branch_relations.js.map