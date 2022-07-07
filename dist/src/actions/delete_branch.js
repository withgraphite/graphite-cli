"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeToDelete = exports.deleteBranchAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const scope_spec_1 = require("../lib/engine/scope_spec");
const errors_1 = require("../lib/errors");
const restack_1 = require("./restack");
function deleteBranchAction(args, context) {
    if (context.metaCache.isTrunk(args.branchName)) {
        throw new errors_1.ExitFailedError('Cannot delete trunk!');
    }
    if (!args.force && !isSafeToDelete(args.branchName, context).result) {
        context.splog.tip(`By default, this command only allows deletion of merged or closed branches.`);
        throw new errors_1.ExitFailedError([
            `The branch ${args.branchName} is not safe to delete.  Use the \`--force\` option to delete it.`,
            `Note that its changes will be lost, as its children will be restacked onto its parent.`,
        ].join('\n'));
    }
    const branchesToRestack = context.metaCache.getRelativeStack(args.branchName, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE);
    context.metaCache.deleteBranch(args.branchName);
    context.splog.info(`Deleted branch ${chalk_1.default.red(args.branchName)}`);
    (0, restack_1.restackBranches)(branchesToRestack, context);
}
exports.deleteBranchAction = deleteBranchAction;
// Where did we merge this? If it was merged on GitHub, we see where it was
// merged into. If we don't detect that it was merged in GitHub but we do
// see the code in trunk, we fallback to say that it was merged into trunk.
// This extra check (rather than just saying trunk) is used to catch the
// case where one feature branch is merged into another on GitHub.
function isSafeToDelete(branchName, context) {
    const prInfo = context.metaCache.getPrInfo(branchName);
    const reason = prInfo?.state === 'CLOSED'
        ? `${chalk_1.default.redBright(branchName)} is closed on GitHub`
        : prInfo?.state === 'MERGED'
            ? `${chalk_1.default.green(branchName)} is merged into ${chalk_1.default.cyan(prInfo?.base ?? context.metaCache.trunk)}`
            : context.metaCache.isMergedIntoTrunk(branchName)
                ? `${chalk_1.default.green(branchName)} is merged into ${chalk_1.default.cyan(context.metaCache.trunk)}`
                : undefined;
    return reason ? { result: true, reason } : { result: false };
}
exports.isSafeToDelete = isSafeToDelete;
//# sourceMappingURL=delete_branch.js.map