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
exports.interactiveCheckout = void 0;
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const utils_1 = require("../lib/utils");
const wrapper_classes_1 = require("../wrapper-classes");
const branch_1 = require("../wrapper-classes/branch");
function interactiveCheckout(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(utils_1.getTrunk(context), context);
        yield promptBranches(stack.toPromptChoices());
    });
}
exports.interactiveCheckout = interactiveCheckout;
function promptBranches(choices) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.Branch.getCurrentBranch();
        let currentBranchIndex = undefined;
        if (currentBranch) {
            currentBranchIndex = choices
                .map((c) => c.value)
                .indexOf(currentBranch.name);
        }
        const chosenBranch = (yield prompts_1.default(Object.assign({ type: 'select', name: 'branch', message: `Checkout a branch`, choices: choices }, (currentBranchIndex ? { initial: currentBranchIndex } : {})), {
            onCancel: () => {
                return;
            },
        })).branch;
        if (!chosenBranch) {
            throw new errors_1.ExitCancelledError('No branch selected');
        }
        if (chosenBranch && chosenBranch !== (currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name)) {
            utils_1.gpExecSync({ command: `git checkout ${chosenBranch}` }, (err) => {
                throw new errors_1.ExitFailedError(`Failed to checkout ${chosenBranch}`, err);
            });
        }
    });
}
//# sourceMappingURL=interactive_checkout.js.map