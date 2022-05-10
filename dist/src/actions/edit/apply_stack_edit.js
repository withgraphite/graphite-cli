"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStackEditExec = exports.applyStackEditPick = void 0;
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const checkout_branch_1 = require("../../lib/utils/checkout_branch");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const splog_1 = require("../../lib/utils/splog");
const current_branch_onto_1 = require("../onto/current_branch_onto");
function applyStackEditPick(opts, context) {
    const onto = preconditions_1.currentBranchPrecondition(context).name;
    checkout_branch_1.checkoutBranch(opts.branchName, { quiet: true });
    current_branch_onto_1.currentBranchOntoAction({
        onto: onto,
        mergeConflictCallstack: [
            {
                op: 'STACK_EDIT_CONTINUATION',
                currentBranchName: onto,
                remainingEdits: opts.remainingEdits,
            },
        ],
    }, context);
}
exports.applyStackEditPick = applyStackEditPick;
function applyStackEditExec(opts, context) {
    const currentBranchName = preconditions_1.currentBranchPrecondition(context).name;
    splog_1.logInfo(`Executing: ${opts.command}`);
    exec_sync_1.gpExecSync({
        command: opts.command,
        options: { stdio: 'inherit' },
    }, () => {
        throw new errors_1.RebaseConflictError(`Execution failed: ${opts.command}.  You can fix the problem, and then run: 'gt continue'`, [
            {
                op: 'STACK_EDIT_CONTINUATION',
                currentBranchName,
                remainingEdits: opts.remainingEdits,
            },
        ], context);
    });
}
exports.applyStackEditExec = applyStackEditExec;
//# sourceMappingURL=apply_stack_edit.js.map