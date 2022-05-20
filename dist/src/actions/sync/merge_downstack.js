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
exports.mergeDownstack = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../../lib/errors");
const pr_info_1 = require("../../lib/sync/pr_info");
const copy_from_remote_1 = require("../../lib/utils/copy_from_remote");
const merge_base_1 = require("../../lib/utils/merge_base");
const splog_1 = require("../../lib/utils/splog");
const trunk_1 = require("../../lib/utils/trunk");
const branch_1 = require("../../wrapper-classes/branch");
function mergeDownstack(downstack, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const overwrittenBranches = calculateOverwrittenBranches(downstack, context);
        if (overwrittenBranches.length) {
            splog_1.logWarn(`'downstack sync' is still in development and does not yet support merging local changes.`);
            splog_1.logWarn(`The following branches' histories will be overwritten if you continue:\n${overwrittenBranches.join('\n')}`);
            if (!(yield prompts_1.default({
                type: 'confirm',
                name: 'value',
                message: `Discard local changes and sync from ${context.repoConfig.getRemote()}?`,
                initial: false,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value) {
                return;
            }
            splog_1.logNewline();
        }
        let parent = trunk_1.getTrunk(context).name;
        for (const branchName of downstack) {
            copy_from_remote_1.copyFromRemote(branchName, context.repoConfig.getRemote());
            // using merge-base here handles the first branch gracefully (can be off trunk)
            // while still ensuring the rest of the branches have correct data
            branch_1.Branch.create(branchName, parent, merge_base_1.getMergeBase(branchName, parent));
            splog_1.logInfo(`${chalk_1.default.green(branchName)} synced from ${context.repoConfig.getRemote()}`);
            parent = branchName;
        }
        yield pr_info_1.syncPRInfoForBranchByName(downstack, context);
    });
}
exports.mergeDownstack = mergeDownstack;
function calculateOverwrittenBranches(downstack, context) {
    return downstack.filter((branchName) => {
        const branch = branch_1.Branch.allBranches(context).find((b) => b.name === branchName);
        if (!branch) {
            return false;
        }
        return (merge_base_1.getMergeBase(branchName, `${context.repoConfig.getRemote()}/${branchName}`) !== branch.getCurrentRef());
    });
}
//# sourceMappingURL=merge_downstack.js.map