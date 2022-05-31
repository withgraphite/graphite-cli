"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentBranchName = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function currentBranchName() {
    const head = exec_sync_1.gpExecSync({
        command: `git rev-parse --abbrev-ref HEAD`,
    });
    return head.length > 0 && head !== 'HEAD' ? head : undefined;
}
exports.currentBranchName = currentBranchName;
//# sourceMappingURL=current_branch_name.js.map