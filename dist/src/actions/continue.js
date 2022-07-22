"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.continueAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const add_all_1 = require("../lib/git/add_all");
const rebase_in_progress_1 = require("../lib/git/rebase_in_progress");
const persist_continuation_1 = require("./persist_continuation");
const print_conflict_status_1 = require("./print_conflict_status");
const restack_1 = require("./restack");
const get_1 = require("./sync/get");
async function continueAction(opts, context) {
    if (!(0, rebase_in_progress_1.rebaseInProgress)()) {
        (0, persist_continuation_1.clearContinuation)(context);
        throw new errors_1.PreconditionsFailedError(`No Graphite command to continue.`);
    }
    if (opts.addAll) {
        (0, add_all_1.addAll)();
    }
    const rebasedBranchBase = context.continueConfig.data.rebasedBranchBase;
    const branchesToSync = context.continueConfig.data?.branchesToSync;
    const branchesToRestack = context.continueConfig.data?.branchesToRestack;
    if (!rebasedBranchBase) {
        (0, persist_continuation_1.clearContinuation)(context);
        context.metaCache.abortRebase();
        throw new errors_1.ExitFailedError('Invalid rebase state, aborting.');
    }
    const cont = context.metaCache.continueRebase(rebasedBranchBase);
    if (cont.result === 'REBASE_CONFLICT') {
        (0, persist_continuation_1.persistContinuation)({ branchesToRestack: branchesToRestack, rebasedBranchBase }, context);
        (0, print_conflict_status_1.printConflictStatus)(`Rebase conflict is not yet resolved.`, context);
        throw new errors_1.RebaseConflictError();
    }
    context.splog.info(`Resolved rebase conflict for ${chalk_1.default.green(cont.branchName)}.`);
    if (branchesToSync) {
        await (0, get_1.getBranchesFromRemote)({
            downstack: branchesToSync,
            base: context.metaCache.currentBranchPrecondition,
            force: false,
        }, context);
    }
    if (branchesToRestack) {
        (0, restack_1.restackBranches)(branchesToRestack, context);
    }
    (0, persist_continuation_1.clearContinuation)(context);
}
exports.continueAction = continueAction;
//# sourceMappingURL=continue.js.map