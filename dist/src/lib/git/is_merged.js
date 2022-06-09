"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMerged = void 0;
const exec_sync_1 = require("../utils/exec_sync");
const diff_1 = require("./diff");
function isMerged({ branchName, trunkName, }) {
    // Are the changes on this branch already applied to main?
    if ((0, exec_sync_1.gpExecSync)({
        command: `git cherry ${trunkName} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $(git merge-base ${branchName} ${trunkName}) -m _)`,
    }).startsWith('-')) {
        return true;
    }
    // Is this branch in the same state as main?
    return (0, diff_1.isDiffEmpty)(branchName, trunkName);
}
exports.isMerged = isMerged;
//# sourceMappingURL=is_merged.js.map