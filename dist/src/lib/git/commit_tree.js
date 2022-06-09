"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitTree = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getCommitTree(branchNames) {
    const allBranches = branchNames.join(' ');
    const ret = {};
    (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: 
        // Check that there is a commit behind this branch before getting the full list.
        `git rev-list --parents ^$(git merge-base --octopus ${allBranches})~1 ${allBranches} 2> /dev/null || git rev-list --parents --all`,
        options: {
            maxBuffer: 1024 * 1024 * 1024,
        },
    })
        .map((l) => l.split(' '))
        .forEach((l) => (ret[l[0]] = l.slice(1)));
    return ret;
}
exports.getCommitTree = getCommitTree;
//# sourceMappingURL=commit_tree.js.map