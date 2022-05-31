"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyBranch = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function isEmptyBranch(branchName, parentName) {
    return (exec_sync_1.gpExecSync({
        command: `git diff --no-ext-diff ${parentName} ${branchName} -- `,
    }).length === 0);
}
exports.isEmptyBranch = isEmptyBranch;
//# sourceMappingURL=is_empty_branch.js.map