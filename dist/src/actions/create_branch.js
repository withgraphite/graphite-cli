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
        throw new errors_1.ExitFailedError(`Must specify either a branch name or commit message.`);
    }
    context.metaCache.checkoutNewBranch(branchName);
    if (opts.all) {
        (0, add_all_1.addAll)();
    }
    if ((0, diff_1.detectStagedChanges)()) {
        context.metaCache.commit({
            message: opts.message,
            patch: !opts.all && opts.patch,
            rollbackOnError: () => context.metaCache.deleteBranch(branchName),
        });
    }
    else {
        context.splog.info(`No staged changes; created a branch with no commit.`);
    }
    // The reason we get the list of siblings here instead of having all
    // the `--insert` logic in a separate function is so that we only
    // show the tip if the user creates a branch with siblings.
    const siblings = context.metaCache
        .getChildren(context.metaCache.getParentPrecondition(branchName))
        .filter((childBranchName) => childBranchName !== branchName);
    if (siblings.length === 0) {
        return;
    }
    if (!opts.insert) {
        context.splog.tip([
            'To insert a created branch into the middle of your stack, use the `--insert` flag.',
            "If you meant to insert this branch, you can rearrange your stack's dependencies with `gt upstack onto`",
        ].join('\n'));
        return;
    }
    // Now we actually handle the `insert` case.
    // Change the parent of each sibling to the new branch.
    siblings.forEach((siblingBranchName) => context.metaCache.setParent(siblingBranchName, branchName));
    // If we're restacking siblings onto this branch, we need to restack
    // all of their recursive children as well. Get all the upstacks!
    (0, restack_1.restackBranches)(siblings.flatMap((siblingBranchName) => context.metaCache.getRelativeStack(siblingBranchName, scope_spec_1.SCOPE.UPSTACK)), context);
}
exports.createBranchAction = createBranchAction;
//# sourceMappingURL=create_branch.js.map