"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceCreateBranch = exports.forceCheckoutNewBranch = exports.switchBranch = exports.deleteBranch = exports.branchMove = exports.getCurrentBranchName = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function getCurrentBranchName() {
    const branchName = (0, exec_sync_1.gpExecSync)({
        command: `git branch --show-current`,
        onError: 'ignore',
    });
    return branchName.length > 0 ? branchName : undefined;
}
exports.getCurrentBranchName = getCurrentBranchName;
function branchMove(newName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git branch -m ${(0, escape_for_shell_1.q)(newName)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.branchMove = branchMove;
function deleteBranch(branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git branch -D ${(0, escape_for_shell_1.q)(branchName)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.deleteBranch = deleteBranch;
function switchBranch(branch, opts) {
    (0, exec_sync_1.gpExecSync)({
        command: `git switch ${opts?.detach ? '-d ' : ''} ${opts?.force ? '-f ' : ''} ${opts?.new ? '-c ' : ''}${(0, escape_for_shell_1.q)(branch)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.switchBranch = switchBranch;
function forceCheckoutNewBranch(branchName, sha) {
    (0, exec_sync_1.gpExecSync)({
        command: `git switch -C ${(0, escape_for_shell_1.q)(branchName)} ${(0, escape_for_shell_1.q)(sha)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.forceCheckoutNewBranch = forceCheckoutNewBranch;
function forceCreateBranch(branchName, sha) {
    (0, exec_sync_1.gpExecSync)({
        command: `git branch -f  ${(0, escape_for_shell_1.q)(branchName)} ${(0, escape_for_shell_1.q)(sha)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.forceCreateBranch = forceCreateBranch;
//# sourceMappingURL=branch_ops.js.map