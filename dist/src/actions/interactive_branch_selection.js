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
const trunk_1 = require("../lib/utils/trunk");
const branch_1 = require("../wrapper-classes/branch");
const meta_stack_builder_1 = require("../wrapper-classes/meta_stack_builder");
function interactiveBranchSelection(context, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.Branch.currentBranch();
        const trunk = trunk_1.getTrunk(context);
        const stack = new meta_stack_builder_1.MetaStackBuilder().fullStackFromBranch(trunk, context);
        const choices = stack.toPromptChoices((opts === null || opts === void 0 ? void 0 : opts.omitCurrentUpstack) ? currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name : undefined);
        const indexOfCurrentIfPresent = choices.findIndex((choice) => choice.value ===
            ((opts === null || opts === void 0 ? void 0 : opts.omitCurrentUpstack)
                ? currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.getParentBranchName()
                : currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name));
        const initial = indexOfCurrentIfPresent !== -1
            ? indexOfCurrentIfPresent
            : choices.findIndex((choice) => choice.value === trunk.name);
        const chosenBranch = (yield prompts_1.default({
            type: 'select',
            name: 'branch',
            message: opts.message,
            choices,
            initial,
        }, {
            onCancel: () => {
                throw new errors_1.ExitCancelledError('No branch selected');
            },
        })).branch;
        context.splog.logDebug(`Selected ${chosenBranch}`);
        return chosenBranch;
    });
}
exports.interactiveBranchSelection = interactiveBranchSelection;
//# sourceMappingURL=interactive_branch_selection.js.map