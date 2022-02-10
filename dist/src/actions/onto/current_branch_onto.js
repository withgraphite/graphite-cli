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
exports.currentBranchOntoAction = void 0;
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const utils_1 = require("../../lib/utils");
const stack_onto_1 = require("./stack_onto");
function currentBranchOntoAction(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.trackedUncommittedChanges()) {
            throw new errors_1.PreconditionsFailedError('Cannot fix with uncommitted changes');
        }
        const originalBranch = preconditions_1.currentBranchPrecondition();
        yield stack_onto_1.stackOnto({
            currentBranch: originalBranch,
            onto: args.onto,
            mergeConflictCallstack: args.mergeConflictCallstack,
        });
        utils_1.checkoutBranch(originalBranch.name);
    });
}
exports.currentBranchOntoAction = currentBranchOntoAction;
//# sourceMappingURL=current_branch_onto.js.map