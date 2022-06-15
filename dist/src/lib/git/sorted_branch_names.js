"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchNamesAndRevisions = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getBranchNamesAndRevisions() {
    const branches = {};
    (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git for-each-ref --format='%(refname:short):%(objectname)' --sort=-committerdate refs/heads/`,
    })
        .map((line) => line.split(':'))
        .filter((lineSplit) => lineSplit.length === 2 && lineSplit.every((s) => s.length > 0))
        .forEach(([branchName, sha]) => (branches[branchName] = sha));
    return branches;
}
exports.getBranchNamesAndRevisions = getBranchNamesAndRevisions;
//# sourceMappingURL=sorted_branch_names.js.map