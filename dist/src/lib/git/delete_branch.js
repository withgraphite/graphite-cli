"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function deleteBranch(branchName) {
    (0, exec_sync_1.gpExecSync)({
        command: `git branch -qD ${(0, escape_for_shell_1.q)(branchName)}`,
    });
}
exports.deleteBranch = deleteBranch;
//# sourceMappingURL=delete_branch.js.map