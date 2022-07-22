"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRemoteBranch = void 0;
const run_command_1 = require("../utils/run_command");
function findRemoteBranch(remote) {
    // e.g. for most repos: branch.main.remote origin
    // we take the first line of the output
    return ((0, run_command_1.runGitCommandAndSplitLines)({
        args: [`config`, `--get-regexp`, `remote$`, `^${remote}$`],
        onError: 'ignore',
        resource: 'findRemoteBranch',
    })[0]
        // and retrieve branchName from `branch.<branchName>.remote`
        ?.split('.')[1] || undefined);
}
exports.findRemoteBranch = findRemoteBranch;
//# sourceMappingURL=find_remote_branch.js.map