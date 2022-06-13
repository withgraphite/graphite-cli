"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
const delete_branch_1 = require("../delete_branch");
/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 *
 * It returns a list of branches whose parents have changed so that we know
 * which branches to restack.
 */
// eslint-disable-next-line max-lines-per-function
async function cleanBranches(opts, context) {
    /**
     * To find and delete all of the merged/closed branches, we traverse all of
     * the stacks off of trunk, greedily deleting the base branches and rebasing
     * the remaining branches.
     *
     * To greedily delete the branches, we keep track of the branches we plan
     * to delete as well as a live snapshot of their children. When a branch
     * we plan to delete has no more children, we know that it is safe to
     * eagerly delete.
     *
     * This eager deletion doesn't matter much in small repos, but matters
     * a lot if a repo has a lot of branches to delete. Whereas previously
     * any error in `repo sync` would throw away all of the work the command did
     * to determine what could and couldn't be deleted, now we take advantage
     * of that work as soon as we can.
     */
    const branchesToProcess = context.metaCache.getChildren(context.metaCache.trunk);
    const branchesToDelete = {};
    const branchesWithNewParents = [];
    /**
     * Since we're doing a DFS, assuming rather even distribution of stacks off
     * of trunk children, we can trace the progress of the DFS through the trunk
     * children to give the user a sense of how far the repo sync has progressed.
     * Note that we only do this if the user has a large number of branches off
     * of trunk (> 50).
     */
    const progressMarkers = opts.showDeleteProgress
        ? getProgressMarkers(branchesToProcess)
        : {};
    while (branchesToProcess.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const branchName = branchesToProcess.pop();
        if (branchName in branchesToDelete) {
            continue;
        }
        if (branchName in progressMarkers) {
            context.splog.info(`${progressMarkers[branchName]} done searching for merged/closed branches to delete...`);
        }
        context.splog.debug(`Checking if should delete ${branchName}...`);
        const shouldDelete = await shouldDeleteBranch({
            branchName: branchName,
            force: opts.force,
        }, context);
        if (shouldDelete) {
            const children = context.metaCache.getChildren(branchName);
            // We concat children here (because we pop above) to make our search a DFS.
            children.forEach((b) => branchesToProcess.push(b));
            // Value in branchesToDelete is a list of children blocking deletion.
            branchesToDelete[branchName] = new Set(children);
            context.splog.debug(`Marked ${branchName} for deletion. Blockers: ${children}`);
        }
        else {
            // We know this branch isn't being deleted.
            // If its parent IS being deleted, we have to change its parent.
            // First, find the nearest ancestor that isn't being deleted.
            const parentBranchName = context.metaCache.getParentPrecondition(branchName);
            let newParentBranchName = parentBranchName;
            while (newParentBranchName in branchesToDelete) {
                newParentBranchName =
                    context.metaCache.getParentPrecondition(newParentBranchName);
            }
            // If the nearest ancestor is not already the parent, we make it so.
            if (newParentBranchName !== parentBranchName) {
                context.metaCache.setParent(branchName, newParentBranchName);
                context.splog.info(`Set parent of ${chalk_1.default.cyan(branchName)} to ${chalk_1.default.blueBright(newParentBranchName)}.`);
                branchesWithNewParents.push(branchName);
                // This branch is no longer blocking its parent's deletion.
                branchesToDelete[parentBranchName].delete(branchName);
                context.splog.debug(`Removed a blocker for ${parentBranchName}. Blockers: ${[
                    ...branchesToDelete[parentBranchName].entries(),
                ]}`);
            }
        }
        greedilyDeleteUnblockedBranches(branchesToDelete, context);
    }
    return branchesWithNewParents;
}
exports.cleanBranches = cleanBranches;
// With either path in the above, we may have unblocked a branch that can
// be deleted immediately. We repeatedly check for branches that can be
// deleted, because the act of deleting one branch may free up another.
function greedilyDeleteUnblockedBranches(branchesToDelete, context) {
    const unblockedBranches = Object.keys(branchesToDelete).filter((branchToDelete) => branchesToDelete[branchToDelete].size === 0);
    context.splog.debug(`Unblocked branches: ${unblockedBranches}`);
    while (unblockedBranches.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const branchName = unblockedBranches.pop();
        const parentBranchName = context.metaCache.getParentPrecondition(branchName);
        (0, delete_branch_1.deleteBranchAction)({ branchName: branchName, force: true }, context);
        // This branch is no longer blocking its parent's deletion.
        // Remove it from the parents list of blockers and check if parent is
        // now unblocked for deletion.
        if (branchesToDelete[parentBranchName]?.delete(branchName) &&
            branchesToDelete[parentBranchName].size === 0) {
            context.splog.debug(`${parentBranchName} is now unblocked.`);
            unblockedBranches.push(parentBranchName);
        }
        // Remove the branch from the list of branches to delete.
        delete branchesToDelete[branchName];
    }
}
function getProgressMarkers(trunkChildren) {
    const progressMarkers = {};
    trunkChildren
        // Ignore the first child - don't show 0% progress.
        .slice(1)
        .forEach((child, i) => (progressMarkers[child] = `${+(
    // Add 1 to the overall children length to account for the fact that
    // when we're on the last trunk child, we're not 100% done - we need
    // to go through its stack.
    ((i + 1 / (trunkChildren.length + 1)) * 100).toFixed(2))}%`));
    return progressMarkers;
}
async function shouldDeleteBranch(args, context) {
    const shouldDelete = (0, delete_branch_1.isSafeToDelete)(args.branchName, context);
    if (!shouldDelete.result) {
        return false;
    }
    if (args.force) {
        return true;
    }
    if (!context.interactive) {
        return false;
    }
    return ((await (0, prompts_1.default)({
        type: 'confirm',
        name: 'value',
        message: `${shouldDelete.reason}. Delete it?`,
        initial: true,
    }, {
        onCancel: () => {
            throw new errors_1.KilledError();
        },
    })).value === true);
}
//# sourceMappingURL=clean_branches.js.map