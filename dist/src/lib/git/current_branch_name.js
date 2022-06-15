"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentBranchName = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getCurrentBranchName() {
    const branchName = (0, exec_sync_1.gpExecSync)({
        command: `git branch --show-current`,
    });
    return branchName.length > 0 ? branchName : undefined;
}
exports.getCurrentBranchName = getCurrentBranchName;
//# sourceMappingURL=current_branch_name.js.map