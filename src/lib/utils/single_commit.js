"use strict";
exports.__esModule = true;
exports.getSingleCommitOnBranch = void 0;
var wrapper_classes_1 = require("../../wrapper-classes");
function getSingleCommitOnBranch(branch) {
    var commits = branch.getCommitSHAs();
    if (commits.length !== 1) {
        return null;
    }
    return new wrapper_classes_1.Commit(commits[0]);
}
exports.getSingleCommitOnBranch = getSingleCommitOnBranch;
