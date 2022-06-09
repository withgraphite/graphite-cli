"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRemoteBranch = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function findRemoteBranch(remote) {
    // e.g. for most repos: branch.main.remote origin
    // we take the first line of the output
    const branchName = (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git config --get-regexp remote$ "^${remote}$"`,
    })[0]
        // and retrieve branchName from `branch.<branchName>.remote`
        ?.split('.')[1];
    if (!branchName) {
        return undefined;
    }
    return branchName;
}
exports.findRemoteBranch = findRemoteBranch;
//# sourceMappingURL=find_remote_branch.js.map