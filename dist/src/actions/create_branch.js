"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranchAction = void 0;
const scope_spec_1 = require("../lib/engine/scope_spec");
const errors_1 = require("../lib/errors");
const add_all_1 = require("../lib/git/add_all");
const diff_1 = require("../lib/git/diff");
const branch_name_1 = require("../lib/utils/branch_name");
const restack_1 = require("./restack");
async function createBranchAction(opts, context) {
    const branchName = (0, branch_name_1.newBranchName)(opts.branchName, opts.message, context);
    if (!branchName) {
        throw new errors_1.ExitFailedError(`Must specify either a branch name or commit message`);
    }
    if (opts.all) {
        (0, add_all_1.addAll)();
    }
    context.metaCache.checkoutNewBranch(branchName);
    const isAddingEmptyCommit = !(0, diff_1.detectStagedChanges)();
    /**
     * Here, we silence errors and ignore them. This
     * isn't great but our main concern is that we're able to create
     * and check out the new branch and these types of error point to
     * larger failure outside of our control.
     */
    context.metaCache.commit({
        allowEmpty: isAddingEmptyCommit,
        message: opts.message,
        rollbackOnError: () => context.metaCache.deleteBranch(branchName),
    });
    if (opts.insert) {
        restackSiblings(branchName, context);
    }
    else {
        context.splog.tip('To insert a branch into a stack, try out the `--insert` flag.');
        return;
    }
}
exports.createBranchAction = createBranchAction;
function restackSiblings(branchName, context) {
    // If we're restacking siblings onto this branch, we need to restack
    // all of their recursive children as well. Get all the upstacks!
    const branchesToRestack = context.metaCache
        .getChildren(context.metaCache.getParentPrecondition(branchName))
        .filter((childBranchName) => childBranchName !== branchName)
        .flatMap((childBranchName) => {
        // Here we actually set the parent of each sibling to the new branch
        context.metaCache.setParent(childBranchName, branchName);
        return context.metaCache.getRelativeStack(childBranchName, scope_spec_1.SCOPE.UPSTACK);
    });
    (0, restack_1.restackBranches)(branchesToRestack, context);
}
//# sourceMappingURL=create_branch.js.map