"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const errors_1 = require("../lib/errors");
class GitStackBuilder extends _1.AbstractStackBuilder {
    getBranchParent(branch, context) {
        return branch.getParentsFromGit(context)[0];
    }
    getChildrenForBranch(branch, context) {
        this.checkSiblingBranches(branch, context);
        return branch.getChildrenFromGit(context);
    }
    getParentForBranch(branch, context) {
        this.checkSiblingBranches(branch, context);
        const parents = branch.getParentsFromGit(context);
        if (parents.length > 1) {
            throw new errors_1.MultiParentError(branch, parents);
        }
        return parents[0];
    }
    checkSiblingBranches(branch, context) {
        const siblingBranches = branch.branchesWithSameCommit(context);
        if (siblingBranches.length > 0) {
            throw new errors_1.SiblingBranchError([branch].concat(siblingBranches), context);
        }
    }
}
exports.default = GitStackBuilder;
//# sourceMappingURL=git_stack_builder.js.map