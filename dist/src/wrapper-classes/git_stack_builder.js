"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const errors_1 = require("../lib/errors");
class GitStackBuilder extends _1.AbstractStackBuilder {
    getBranchParent(branch) {
        return branch.getParentsFromGit()[0];
    }
    getChildrenForBranch(branch) {
        this.checkSiblingBranches(branch);
        return branch.getChildrenFromGit();
    }
    getParentForBranch(branch) {
        this.checkSiblingBranches(branch);
        const parents = branch.getParentsFromGit();
        if (parents.length > 1) {
            throw new errors_1.MultiParentError(branch, parents);
        }
        return parents[0];
    }
    checkSiblingBranches(branch) {
        const siblingBranches = branch.branchesWithSameCommit();
        if (siblingBranches.length > 0) {
            throw new errors_1.SiblingBranchError([branch].concat(siblingBranches));
        }
    }
}
exports.default = GitStackBuilder;
//# sourceMappingURL=git_stack_builder.js.map