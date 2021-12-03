"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrunk = exports.inferTrunk = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const config_1 = require("../config");
const errors_1 = require("../errors");
function findRemoteOriginBranch() {
    let config;
    try {
        const gitDir = child_process_1.execSync(`git rev-parse --git-dir`).toString().trim();
        config = fs_extra_1.default.readFileSync(path_1.default.join(gitDir, "config")).toString();
    }
    catch (_a) {
        throw new Error(`Failed to read .git config when determining trunk branch`);
    }
    const originBranchSections = config
        .split("[")
        .filter((section) => section.includes('branch "') && section.includes("remote = origin"));
    if (originBranchSections.length !== 1) {
        return undefined;
    }
    try {
        const matches = originBranchSections[0].match(/branch "(.+)"\]/);
        if (matches && matches.length == 1) {
            return new branch_1.default(matches[0]);
        }
    }
    catch (_b) {
        return undefined;
    }
    return undefined;
}
function findCommonlyNamedTrunk() {
    const potentialTrunks = branch_1.default.allBranches().filter((b) => ["main", "master", "development", "develop"].includes(b.name));
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    return undefined;
}
let memoizedTrunk;
function inferTrunk() {
    return findRemoteOriginBranch() || findCommonlyNamedTrunk();
}
exports.inferTrunk = inferTrunk;
function getTrunk() {
    if (memoizedTrunk) {
        return memoizedTrunk;
    }
    const configTrunkName = config_1.repoConfig.getTrunk();
    if (configTrunkName) {
        if (!branch_1.default.exists(configTrunkName)) {
            throw new errors_1.ExitFailedError(`Configured trunk branch (${configTrunkName}) not found in the current repo. Consider updating the trunk name by running "gt repo init".`);
        }
        memoizedTrunk = new branch_1.default(configTrunkName, { useMemoizedResults: true });
    }
    // No configured trunk, infer
    if (!memoizedTrunk) {
        const inferredTrunk = inferTrunk();
        if (inferredTrunk) {
            memoizedTrunk = inferredTrunk.useMemoizedResults();
            return memoizedTrunk;
        }
        throw new errors_1.ConfigError(`No configured trunk branch, and unable to infer. Consider setting the trunk name by running "gt repo init".`);
    }
    const trunkSiblings = memoizedTrunk.branchesWithSameCommit();
    if (trunkSiblings.length > 0) {
        throw new errors_1.SiblingBranchError([memoizedTrunk].concat(trunkSiblings));
    }
    return memoizedTrunk;
}
exports.getTrunk = getTrunk;
//# sourceMappingURL=trunk.js.map