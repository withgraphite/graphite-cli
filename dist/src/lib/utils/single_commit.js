"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleCommitOnBranch = void 0;
const wrapper_classes_1 = require("../../wrapper-classes");
function getSingleCommitOnBranch(branch) {
    const commits = branch.getNonEmptyCommitSHAs();
    if (commits.length !== 1) {
        return null;
    }
    return new wrapper_classes_1.Commit(commits[0]);
}
exports.getSingleCommitOnBranch = getSingleCommitOnBranch;
//# sourceMappingURL=single_commit.js.map