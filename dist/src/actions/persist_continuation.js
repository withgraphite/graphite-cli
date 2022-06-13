"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearContinuation = exports.persistContinuation = void 0;
function persistContinuation(args, context) {
    const [branchesToRestack, branchesToSync] = [
        args.branchesToRestack ?? [],
        args.branchesToSync ?? [],
    ];
    context.splog.debug(branchesToSync.reduce((acc, curr) => `${acc}\n${curr}`, 'PERSISTING (sync):'));
    context.splog.debug(branchesToRestack.reduce((acc, curr) => `${acc}\n${curr}`, 'PERSISTING (restack):'));
    context.continueConfig.update((data) => {
        data.branchesToSync = branchesToSync;
        data.branchesToRestack = branchesToRestack;
        data.currentBranchOverride = context.metaCache.currentBranch;
    });
}
exports.persistContinuation = persistContinuation;
function clearContinuation(context) {
    context.continueConfig.update((data) => {
        data.branchesToSync = [];
        data.branchesToRestack = [];
        data.currentBranchOverride = undefined;
    });
}
exports.clearContinuation = clearContinuation;
//# sourceMappingURL=persist_continuation.js.map