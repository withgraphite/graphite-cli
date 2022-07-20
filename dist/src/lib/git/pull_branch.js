"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBranch = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function pullBranch(remote, branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git pull --ff-only ${(0, escape_for_shell_1.q)(remote)} ${(0, escape_for_shell_1.q)(branchName)}`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.pullBranch = pullBranch;
//# sourceMappingURL=pull_branch.js.map