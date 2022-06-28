"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restackBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
const persist_continuation_1 = require("./persist_continuation");
const print_conflict_status_1 = require("./print_conflict_status");
function restackBranches(branchNames, context) {
    context.splog.debug(branchNames.reduce((acc, curr) => `${acc}\n${curr}`, 'RESTACKING:'));
    while (branchNames.length > 0) {
        const branchName = branchNames.shift();
        if (context.metaCache.isTrunk(branchName)) {
            context.splog.info(`${chalk_1.default.cyan(branchName)} does not need to be restacked.`);
            continue;
        }
        const result = context.metaCache.restackBranch(branchName);
        context.splog.debug(`${result}: ${branchName}`);
        switch (result.result) {
            case 'REBASE_DONE':
                context.splog.info(`Restacked ${chalk_1.default.green(branchName)} on ${chalk_1.default.cyan(context.metaCache.getParentPrecondition(branchName))}.`);
                continue;
            case 'REBASE_CONFLICT':
                (0, persist_continuation_1.persistContinuation)({
                    branchesToRestack: branchNames,
                    rebasedBranchBase: result.rebasedBranchBase,
                }, context);
                (0, print_conflict_status_1.printConflictStatus)(`Hit conflict restacking ${chalk_1.default.yellow(branchName)} on ${chalk_1.default.cyan(context.metaCache.getParentPrecondition(branchName))}.`, context);
                throw new errors_1.RebaseConflictError();
            case 'REBASE_UNNEEDED':
                context.splog.info(`${chalk_1.default.cyan(branchName)} does not need to be restacked${` on ${chalk_1.default.cyan(context.metaCache.getParentPrecondition(branchName))}`}.`);
                continue;
            default:
                (0, assert_unreachable_1.assertUnreachable)(result);
        }
    }
}
exports.restackBranches = restackBranches;
//# sourceMappingURL=restack.js.map