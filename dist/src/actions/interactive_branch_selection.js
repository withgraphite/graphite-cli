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
exports.interactiveBranchSelection = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
const branch_1 = require("../wrapper-classes/branch");
function interactiveBranchSelection(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(utils_1.getTrunk(context), context);
        return yield promptBranches(stack.toPromptChoices());
    });
}
exports.interactiveBranchSelection = interactiveBranchSelection;
function promptBranches(choices) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.Branch.getCurrentBranch();
        const currentBranchIndex = currentBranch
            ? choices.map((c) => c.value).indexOf(currentBranch.name)
            : undefined;
        const chosenBranch = (yield prompts_1.default(Object.assign({ type: 'select', name: 'branch', message: `Checkout a branch`, choices: choices }, (currentBranchIndex ? { initial: currentBranchIndex } : {})), {
            onCancel: () => {
                return;
            },
        })).branch;
        if (!chosenBranch) {
            throw new errors_1.ExitCancelledError('No branch selected');
        }
        return chosenBranch;
    });
}
//# sourceMappingURL=interactive_branch_selection.js.map