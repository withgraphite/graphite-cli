"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const scope_spec_1 = require("../lib/engine/scope_spec");
const log_1 = require("./log");
async function checkoutBranch({ branchName, showUntracked, }, context) {
    if (!branchName) {
        branchName = await (0, log_1.interactiveBranchSelection)({
            message: 'Checkout a branch (autocomplete or arrow keys)',
            showUntracked,
        }, context);
    }
    if (branchName === context.metaCache.currentBranch) {
        context.splog.info(`Already on ${chalk_1.default.cyan(branchName)}.`);
        return;
    }
    context.metaCache.checkoutBranch(branchName);
    context.splog.info(`Checked out ${chalk_1.default.cyan(branchName)}.`);
    printBranchInfo(branchName, context);
}
exports.checkoutBranch = checkoutBranch;
function printBranchInfo(branchName, context) {
    if (!context.metaCache.isTrunk(branchName) &&
        !context.metaCache.isBranchTracked(branchName)) {
        context.splog.info(`This branch is not tracked by Graphite.`);
    }
    else if (!context.metaCache.isBranchFixed(branchName)) {
        context.splog.info(`This branch has fallen behind ${chalk_1.default.blueBright(context.metaCache.getParentPrecondition(branchName))} - you may want to ${chalk_1.default.cyan(`gt upstack restack`)}.`);
    }
    else {
        const nearestAncestorNeedingRestack = context.metaCache
            .getRelativeStack(branchName, scope_spec_1.SCOPE.DOWNSTACK)
            .reverse()
            .find((ancestor) => !context.metaCache.isBranchFixed(ancestor));
        if (nearestAncestorNeedingRestack) {
            context.splog.info(`The downstack branch ${chalk_1.default.cyan(nearestAncestorNeedingRestack)} has fallen behind ${chalk_1.default.blueBright(context.metaCache.getParentPrecondition(nearestAncestorNeedingRestack))} - you may want to ${chalk_1.default.cyan(`gt stack restack`)}.`);
        }
    }
}
//# sourceMappingURL=checkout_branch.js.map