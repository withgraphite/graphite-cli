"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleCommitOnBranch = void 0;
const commit_1 = require("../../wrapper-classes/commit");
function getSingleCommitOnBranch(branch, context) {
    const commits = branch.getCommitSHAs(context);
    if (commits.length !== 1) {
        return null;
    }
    return new commit_1.Commit(commits[0]);
}
exports.getSingleCommitOnBranch = getSingleCommitOnBranch;
//# sourceMappingURL=single_commit.js.map