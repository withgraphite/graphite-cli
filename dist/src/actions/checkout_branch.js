"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("./log");
async function checkoutBranch(branchName, context) {
    if (!branchName) {
        branchName = await (0, log_1.interactiveBranchSelection)({
            message: 'Checkout a branch (autocomplete or arrow keys)',
        }, context);
    }
    if (branchName === context.metaCache.currentBranch) {
        context.splog.info(`Already on ${chalk_1.default.cyan(branchName)}.`);
        return;
    }
    context.metaCache.checkoutBranch(branchName);
    context.splog.info(`Checked out ${chalk_1.default.cyan(branchName)}.`);
}
exports.checkoutBranch = checkoutBranch;
//# sourceMappingURL=checkout_branch.js.map