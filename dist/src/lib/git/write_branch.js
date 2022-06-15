"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceCreateBranch = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function forceCreateBranch(branchName, sha) {
    (0, exec_sync_1.gpExecSync)({
        command: `git switch -C ${(0, escape_for_shell_1.q)(branchName)} ${(0, escape_for_shell_1.q)(sha)}`,
    });
}
exports.forceCreateBranch = forceCreateBranch;
//# sourceMappingURL=write_branch.js.map