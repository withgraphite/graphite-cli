"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranchAction = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const addAll_1 = require("../lib/utils/addAll");
const branch_name_1 = require("../lib/utils/branch_name");
const checkout_branch_1 = require("../lib/utils/checkout_branch");
const commit_1 = require("../lib/utils/commit");
const detect_staged_changes_1 = require("../lib/utils/detect_staged_changes");
const exec_sync_1 = require("../lib/utils/exec_sync");
const splog_1 = require("../lib/utils/splog");
const branch_1 = require("../wrapper-classes/branch");
const meta_stack_builder_1 = require("../wrapper-classes/meta_stack_builder");
const current_branch_onto_1 = require("./onto/current_branch_onto");
function createBranchAction(opts, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const parentBranch = preconditions_1.currentBranchPrecondition(context);
        const branchName = branch_name_1.newBranchName(opts.branchName, opts.commitMessage, context);
        if (!branchName) {
            throw new errors_1.ExitFailedError(`Must specify either a branch name or commit message`);
        }
        if (opts.addAll) {
            addAll_1.addAll();
        }
        checkout_branch_1.checkoutBranch(branchName, { new: true });
        const isAddingEmptyCommit = !detect_staged_changes_1.detectStagedChanges();
        /**
         * Here, we silence errors and ignore them. This
         * isn't great but our main concern is that we're able to create
         * and check out the new branch and these types of error point to
         * larger failure outside of our control.
         */
        commit_1.commit({
            allowEmpty: isAddingEmptyCommit,
            message: opts.commitMessage,
            rollbackOnError: () => {
                // Commit failed, usually due to precommit hooks. Rollback the branch.
                checkout_branch_1.checkoutBranch(parentBranch.name, { quiet: true });
                exec_sync_1.gpExecSync({
                    command: `git branch -d ${branchName}`,
                    options: { stdio: 'ignore' },
                });
                throw new errors_1.ExitFailedError('Failed to commit changes, aborting');
            },
        });
        // If the branch previously existed and the stale metadata is still around,
        // make sure that we wipe that stale metadata.
        branch_1.Branch.create(branchName, parentBranch.name, parentBranch.getCurrentRef());
        if (isAddingEmptyCommit) {
            splog_1.logInfo('Since no changes were staged, an empty commit was added to track Graphite stack dependencies. If you wish to get rid of the empty commit you can amend, or squash when merging.');
        }
        if (opts.restack) {
            new meta_stack_builder_1.MetaStackBuilder()
                .upstackInclusiveFromBranchWithoutParents(parentBranch, context)
                .source.children.map((node) => node.branch)
                .filter((b) => b.name != branchName)
                .forEach((b) => {
                checkout_branch_1.checkoutBranch(b.name, { quiet: true });
                splog_1.logInfo(`Stacking (${b.name}) onto (${branchName})...`);
                current_branch_onto_1.currentBranchOntoAction({
                    onto: branchName,
                    mergeConflictCallstack: [],
                }, context);
            });
            checkout_branch_1.checkoutBranch(branchName, { quiet: true });
        }
    });
}
exports.createBranchAction = createBranchAction;
//# sourceMappingURL=create_branch.js.map