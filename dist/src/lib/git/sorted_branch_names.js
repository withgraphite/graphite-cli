"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortedBranchNames = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function sortedBranchNames() {
    return exec_sync_1.gpExecSync({
        command: `git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`,
    })
        .split('\n')
        .filter((branchName) => branchName.length > 0);
}
exports.sortedBranchNames = sortedBranchNames;
//# sourceMappingURL=sorted_branch_names.js.map