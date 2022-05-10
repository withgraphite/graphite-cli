"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentBranchOntoAction = void 0;
const preconditions_1 = require("../../lib/preconditions");
const checkout_branch_1 = require("../../lib/utils/checkout_branch");
const stack_onto_1 = require("./stack_onto");
function currentBranchOntoAction(args, context) {
    preconditions_1.uncommittedTrackedChangesPrecondition();
    const originalBranch = preconditions_1.currentBranchPrecondition(context);
    stack_onto_1.stackOnto({
        currentBranch: originalBranch,
        onto: args.onto,
        mergeConflictCallstack: args.mergeConflictCallstack,
    }, context);
    checkout_branch_1.checkoutBranch(originalBranch.name, { quiet: true });
}
exports.currentBranchOntoAction = currentBranchOntoAction;
//# sourceMappingURL=current_branch_onto.js.map