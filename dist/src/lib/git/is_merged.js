"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMerged = void 0;
const run_command_1 = require("../utils/run_command");
const diff_1 = require("./diff");
const merge_base_1 = require("./merge_base");
function isMerged({ branchName, trunkName, }) {
    const sha = (0, run_command_1.runGitCommand)({
        args: [
            `commit-tree`,
            `${branchName}^{tree}`,
            `-p`,
            (0, merge_base_1.getMergeBase)(branchName, trunkName),
            `-m`,
            `_`,
        ],
        onError: 'ignore',
        resource: 'mergeBaseCommitTree',
    });
    // Are the changes on this branch already applied to main?
    if (sha &&
        (0, run_command_1.runGitCommand)({
            args: [`cherry`, trunkName, sha],
            onError: 'ignore',
            resource: 'isMerged',
        }).startsWith('-')) {
        return true;
    }
    // Is this branch in the same state as main?
    return (0, diff_1.isDiffEmpty)(branchName, trunkName);
}
exports.isMerged = isMerged;
//# sourceMappingURL=is_merged.js.map