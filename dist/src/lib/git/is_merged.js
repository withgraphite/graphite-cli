"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMerged = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function isMerged({ branchName, trunkName, }) {
    // Are the changes on this branch already applied to main?
    if (exec_sync_1.gpExecSync({
        command: `git cherry ${trunkName} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $(git merge-base ${branchName} ${trunkName}) -m _)`,
    }).startsWith('-')) {
        return true;
    }
    // Is this branch in the same state as main?
    if (exec_sync_1.gpExecSync({
        command: `git diff --no-ext-diff ${branchName} ${trunkName} | wc -l`,
    }) === '0') {
        return true;
    }
    return false;
}
exports.isMerged = isMerged;
//# sourceMappingURL=is_merged.js.map