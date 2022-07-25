"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceCreateBranch = exports.forceCheckoutNewBranch = exports.switchBranch = exports.deleteBranch = exports.moveBranch = exports.getCurrentBranchName = void 0;
const run_command_1 = require("../utils/run_command");
function getCurrentBranchName() {
    const branchName = (0, run_command_1.runGitCommand)({
        args: [`branch`, `--show-current`],
        onError: 'ignore',
        resource: 'getCurrentBranchName',
    });
    return branchName.length > 0 ? branchName : undefined;
}
exports.getCurrentBranchName = getCurrentBranchName;
function moveBranch(newName) {
    (0, run_command_1.runGitCommand)({
        args: [`branch`, `-m`, newName],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'moveBranch',
    });
}
exports.moveBranch = moveBranch;
function deleteBranch(branchName) {
    (0, run_command_1.runGitCommand)({
        args: [`branch`, `-D`, branchName],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'deleteBranch',
    });
}
exports.deleteBranch = deleteBranch;
function switchBranch(branch, opts) {
    (0, run_command_1.runGitCommand)({
        args: [
            `switch`,
            ...(opts?.detach ? ['-d'] : []),
            ...(opts?.force ? ['-f'] : []),
            ...(opts?.new ? ['-c'] : []),
            branch,
        ],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'switchBranch',
    });
}
exports.switchBranch = switchBranch;
function forceCheckoutNewBranch(branchName, sha) {
    (0, run_command_1.runGitCommand)({
        args: [`switch`, `-C`, branchName, sha],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'forceCheckoutNewBranch',
    });
}
exports.forceCheckoutNewBranch = forceCheckoutNewBranch;
function forceCreateBranch(branchName, sha) {
    (0, run_command_1.runGitCommand)({
        args: [`branch`, `-f`, branchName, sha],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'forceCreateBranch',
    });
}
exports.forceCreateBranch = forceCreateBranch;
//# sourceMappingURL=branch_ops.js.map