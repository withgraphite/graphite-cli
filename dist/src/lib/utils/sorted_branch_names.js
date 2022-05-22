"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortedBranchNames = void 0;
const child_process_1 = require("child_process");
function sortedBranchNames() {
    return child_process_1.execSync(`git for-each-ref --format='%(refname:short)' --sort=-committerdate refs/heads/`)
        .toString()
        .trim()
        .split('\n')
        .filter((branchName) => branchName.length > 0);
}
exports.sortedBranchNames = sortedBranchNames;
//# sourceMappingURL=sorted_branch_names.js.map