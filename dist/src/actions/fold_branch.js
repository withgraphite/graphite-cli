"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldCurrentBranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const scope_spec_1 = require("../lib/engine/scope_spec");
const restack_1 = require("./restack");
function foldCurrentBranch(keep, context) {
    const currentBranchName = context.metaCache.currentBranchPrecondition;
    const parentBranchName = context.metaCache.getParentPrecondition(currentBranchName);
    context.metaCache.foldCurrentBranch(keep);
    if (keep) {
        context.splog.info(`Folded ${chalk_1.default.green(currentBranchName)} into ${chalk_1.default.blueBright(parentBranchName)}.`);
    }
    else {
        context.splog.info(`Folded ${chalk_1.default.blueBright(currentBranchName)} into ${chalk_1.default.green(parentBranchName)}.`);
        context.splog.tip(`To keep the name of the current branch, use the \`--keep\` flag.`);
    }
    (0, restack_1.restackBranches)(context.metaCache.getRelativeStack(context.metaCache.currentBranchPrecondition, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE), context);
}
exports.foldCurrentBranch = foldCurrentBranch;
//# sourceMappingURL=fold_branch.js.map