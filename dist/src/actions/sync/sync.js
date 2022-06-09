"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullTrunk = exports.syncAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const scope_spec_1 = require("../../lib/engine/scope_spec");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const restack_1 = require("../restack");
const sync_pr_info_1 = require("../sync_pr_info");
const clean_branches_1 = require("./clean_branches");
async function syncAction(opts, context) {
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    if (opts.pull) {
        pullTrunk(context);
        context.splog.tip('You can skip pulling trunk with the `--no-pull` flag.');
    }
    const branchesToRestack = [];
    await (0, sync_pr_info_1.syncPrInfo)(context.metaCache.allBranchNames, context);
    if (opts.delete) {
        context.splog.info(`Checking if any branches have been merged/closed and can be deleted...`);
        const branchesWithNewParents = await (0, clean_branches_1.cleanBranches)({ showDeleteProgress: opts.showDeleteProgress, force: opts.force }, context);
        context.splog.tip([
            'You can skip deleting branches with the `--no-delete` flag.',
            ...(opts.force
                ? []
                : [
                    'Try the `--force` flag to delete merged branches without prompting for each.',
                ]),
            ...(opts.restack
                ? []
                : [
                    'Try the `--restack` flag to automatically restack the current stack as well as any stacks with deleted branches.',
                ]),
        ].join('\n'));
        if (!opts.restack) {
            return;
        }
        branchesWithNewParents
            .flatMap((branchName) => context.metaCache.getRelativeStack(branchName, scope_spec_1.SCOPE.UPSTACK))
            .forEach((branchName) => branchesToRestack.push(branchName));
    }
    if (!opts.restack) {
        context.splog.tip('Try the `--restack` flag to automatically restack the current stack.');
        return;
    }
    const currentBranch = context.metaCache.currentBranch;
    if (currentBranch &&
        context.metaCache.branchExists(currentBranch) &&
        context.metaCache.isBranchTracked(currentBranch) &&
        !branchesToRestack.includes(currentBranch)) {
        context.metaCache
            .getRelativeStack(currentBranch, scope_spec_1.SCOPE.STACK)
            .forEach((branchName) => branchesToRestack.push(branchName));
    }
    (0, restack_1.restackBranches)(branchesToRestack, context);
}
exports.syncAction = syncAction;
function pullTrunk(context) {
    context.splog.info(`Pulling ${chalk_1.default.cyan(context.metaCache.trunk)} from remote...`);
    try {
        context.splog.info(context.metaCache.pullTrunk() === 'PULL_UNNEEDED'
            ? `${chalk_1.default.green(context.metaCache.trunk)} is up to date.`
            : `${chalk_1.default.green(context.metaCache.trunk)} fast-forwarded to ${chalk_1.default.gray(context.metaCache.getRevision(context.metaCache.trunk))}.`);
    }
    catch (err) {
        throw new errors_1.ExitFailedError(`Failed to pull trunk`, err);
    }
}
exports.pullTrunk = pullTrunk;
//# sourceMappingURL=sync.js.map