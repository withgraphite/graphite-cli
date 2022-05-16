"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrunk = exports.inferTrunk = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const branch_1 = require("../../wrapper-classes/branch");
const errors_1 = require("../errors");
const branch_exists_1 = require("./branch_exists");
function findRemoteOriginBranch(context) {
    let config;
    try {
        const gitDir = child_process_1.execSync(`git rev-parse --git-dir`).toString().trim();
        config = fs_extra_1.default.readFileSync(path_1.default.join(gitDir, 'config')).toString();
    }
    catch (_a) {
        throw new Error(`Failed to read .git config when determining trunk branch`);
    }
    const originBranchSections = config
        .split('[')
        .filter((section) => section.includes('branch "') &&
        section.includes(`remote = ${context.repoConfig.getRemote()}`));
    if (originBranchSections.length !== 1) {
        return undefined;
    }
    try {
        const matches = originBranchSections[0].match(/branch "(.+)"\]/);
        if (matches && matches.length == 1) {
            return new branch_1.Branch(matches[0]);
        }
    }
    catch (_b) {
        return undefined;
    }
    return undefined;
}
function findCommonlyNamedTrunk(context) {
    const potentialTrunks = branch_1.Branch.allBranches(context).filter((b) => ['main', 'master', 'development', 'develop'].includes(b.name));
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    return undefined;
}
function inferTrunk(context) {
    return findRemoteOriginBranch(context) || findCommonlyNamedTrunk(context);
}
exports.inferTrunk = inferTrunk;
function getTrunk(context) {
    const configTrunkName = context.repoConfig.data.trunk;
    if (!configTrunkName) {
        throw new errors_1.ConfigError(`No configured trunk branch. Consider setting the trunk name by running "gt repo init".`);
    }
    if (!branch_exists_1.branchExists(configTrunkName)) {
        throw new errors_1.ExitFailedError(`Configured trunk branch (${configTrunkName}) not found in the current repo. Consider updating the trunk name by running "gt repo init".`);
    }
    return new branch_1.Branch(configTrunkName);
}
exports.getTrunk = getTrunk;
//# sourceMappingURL=trunk.js.map