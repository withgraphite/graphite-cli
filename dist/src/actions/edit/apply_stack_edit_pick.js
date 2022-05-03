"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStackEditPick = void 0;
const utils_1 = require("../../lib/utils");
const branch_1 = require("../../wrapper-classes/branch");
const stack_onto_1 = require("../onto/stack_onto");
function applyStackEditPick(stackEdit, remainingEdits, context) {
    utils_1.checkoutBranch(stackEdit.branchName, { quiet: true });
    stack_onto_1.stackOnto({
        currentBranch: new branch_1.Branch(stackEdit.branchName),
        onto: stackEdit.onto,
        mergeConflictCallstack: [
            {
                op: 'STACK_EDIT_CONTINUATION',
                currentBranchName: stackEdit.branchName,
                remainingEdits: remainingEdits,
            },
        ],
    }, context);
}
exports.applyStackEditPick = applyStackEditPick;
//# sourceMappingURL=apply_stack_edit_pick.js.map