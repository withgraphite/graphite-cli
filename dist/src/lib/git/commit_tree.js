"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitTree = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function getCommitTree(branchNames) {
    const allBranches = branchNames.map((b) => (0, escape_for_shell_1.q)(b)).join(' ');
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