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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStackEditPick = void 0;
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const stack_onto_1 = require("../onto/stack_onto");
function applyStackEditPick(stackEdit, remainingEdits) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.checkoutBranch(stackEdit.branchName);
        yield stack_onto_1.stackOnto({
            currentBranch: new branch_1.default(stackEdit.branchName),
            onto: stackEdit.onto,
            mergeConflictCallstack: {
                parent: 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER',
                frame: {
                    op: 'STACK_EDIT_CONTINUATION',
                    currentBranch: stackEdit.branchName,
                    remainingEdits: remainingEdits,
                },
            },
        });
    });
}
exports.applyStackEditPick = applyStackEditPick;
//# sourceMappingURL=apply_stack_edit_pick.js.map