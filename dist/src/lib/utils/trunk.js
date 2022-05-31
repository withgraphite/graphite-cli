"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrunk = exports.inferTrunk = void 0;
const branch_1 = require("../../wrapper-classes/branch");
const errors_1 = require("../errors");
const branch_exists_1 = require("../git/branch_exists");
const exec_sync_1 = require("./exec_sync");
function findRemoteBranch(context) {
    var _a;
    // e.g. for most repos: branch.main.remote origin
    // TODO will move this call to the /git/ lib later on in the engine refactor
    const branchName = (_a = exec_sync_1.gpExecSync({
        command: `git config --get-regexp remote$ "^${context.repoConfig.getRemote()}$"`,
    })
        // so, we take the first line of the output
        .split('\n')[0]) === null || _a === void 0 ? void 0 : _a.split('.')[1];
    if (!branchName) {
        return undefined;
    }
    return new branch_1.Branch(branchName);
}
function findCommonlyNamedTrunk(context) {
    const potentialTrunks = branch_1.Branch.allBranches(context).filter((b) => ['main', 'master', 'development', 'develop'].includes(b.name));
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    return undefined;
}
function inferTrunk(context) {
    return findRemoteBranch(context) || findCommonlyNamedTrunk(context);
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