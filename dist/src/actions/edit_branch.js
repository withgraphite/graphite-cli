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
exports.editBranchAction = void 0;
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const exec_sync_1 = require("../lib/utils/exec_sync");
const rebase_in_progress_1 = require("../lib/utils/rebase_in_progress");
const fix_1 = require("./fix");
function editBranchAction(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition(context);
        const baseRev = currentBranch.getParentBranchSha();
        if (!baseRev) {
            throw new errors_1.PreconditionsFailedError(`Graphite does not have a base revision for this branch; it might have been created with an older version of Graphite.  Please run a 'fix' or 'validate' command in order to backfill this information.`);
        }
        // TODO we will kill this once we cut over to relying on parentRevision for fix
        // If we're checked out on a branch, we're going to perform a stack fix later.
        // In order to allow the stack fix to cut out the old commit, we need to set
        // the prev ref here.
        if (currentBranch !== null) {
            currentBranch.savePrevRef();
        }
        exec_sync_1.gpExecSync({
            command: `git rebase -i ${baseRev}`,
            options: { stdio: 'inherit' },
        }, (err) => {
            if (rebase_in_progress_1.rebaseInProgress()) {
                throw new errors_1.RebaseConflictError(`Interactive rebase in progress.  After resolving merge conflicts, run 'gt continue'`, [
                    {
                        op: 'STACK_FIX',
                        sourceBranchName: currentBranch.name,
                    },
                ], context);
            }
            else {
                throw new errors_1.ExitFailedError(`Interactive rebase failed.`, err);
            }
        });
        yield fix_1.rebaseUpstack(context);
    });
}
exports.editBranchAction = editBranchAction;
//# sourceMappingURL=edit_branch.js.map