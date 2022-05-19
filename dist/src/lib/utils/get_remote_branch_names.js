"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteBranchNames = void 0;
const exec_sync_1 = require("./exec_sync");
function getRemoteBranchNames(context) {
    return exec_sync_1.gpExecSync({
        command: `git ls-remote -h ${context.repoConfig.getRemote()}`,
    })
        .toString()
        .trim()
        .split('\n')
        .map((line) => line.split('refs/heads/')[1]);
}
exports.getRemoteBranchNames = getRemoteBranchNames;
//# sourceMappingURL=get_remote_branch_names.js.map