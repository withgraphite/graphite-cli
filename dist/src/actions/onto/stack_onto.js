"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackOntoFixContinuation = exports.stackOntoBaseRebaseContinuation = exports.stackOnto = void 0;
const cache_1 = require("../../lib/config/cache");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
const merge_base_1 = require("../../lib/utils/merge_base");
const rebase_onto_1 = require("../../lib/utils/rebase_onto");
const branch_1 = require("../../wrapper-classes/branch");
const fix_1 = require("../fix");
const validate_1 = require("../validate");
function stackOnto(opts, context) {
    const onto = branch_1.Branch.branchWithName(opts.onto, context);
    checkBranchCanBeMoved(opts.currentBranch, context);
    validate_1.validate('UPSTACK', context);
    const stackOntoContinuationFrame = {
        op: 'STACK_ONTO_BASE_REBASE_CONTINUATION',
        currentBranchName: opts.currentBranch.name,
        onto: opts.onto,
    };
    const parent = opts.currentBranch.getParentFromMeta(context);
    const mergeBase = merge_base_1.getMergeBase(opts.currentBranch.name, (parent !== null && parent !== void 0 ? parent : onto).name);
    const rebased = rebase_onto_1.rebaseOnto({
        onto,
        mergeBase,
        branch: opts.currentBranch,
        mergeConflictCallstack: [
            stackOntoContinuationFrame,
            ...opts.mergeConflictCallstack,
        ],
    }, context);
    if (!rebased) {
        if (!parent) {
            opts.currentBranch.setParentBranch(onto);
        }
        return;
    }
    stackOntoBaseRebaseContinuation(stackOntoContinuationFrame, opts.mergeConflictCallstack, context);
}
exports.stackOnto = stackOnto;
function stackOntoBaseRebaseContinuation(frame, mergeConflictCallstack, context) {
    const currentBranch = branch_1.Branch.branchWithName(frame.currentBranchName, context);
    const onto = frame.onto;
    cache_1.cache.clearAll();
    // set current branch's parent only if the rebase succeeds.
    utils_1.logInfo(`Setting parent of ${currentBranch.name} to ${onto}.`);
    currentBranch.setParentBranch(new branch_1.Branch(onto));
    // Now perform a fix starting from the onto branch:
    const stackOntoContinuationFrame = {
        op: 'STACK_ONTO_FIX_CONTINUATION',
        currentBranchName: frame.currentBranchName,
        onto: frame.onto,
    };
    fix_1.restackBranch({
        branch: currentBranch,
        mergeConflictCallstack: [
            stackOntoContinuationFrame,
            ...mergeConflictCallstack,
        ],
    }, context);
    stackOntoFixContinuation(stackOntoContinuationFrame);
}
exports.stackOntoBaseRebaseContinuation = stackOntoBaseRebaseContinuation;
function stackOntoFixContinuation(frame) {
    utils_1.logInfo(`Successfully moved (${frame.currentBranchName}) onto (${frame.onto})`);
}
exports.stackOntoFixContinuation = stackOntoFixContinuation;
function checkBranchCanBeMoved(branch, context) {
    if (branch.name === utils_1.getTrunk(context).name) {
        throw new errors_1.PreconditionsFailedError(`Cannot move (${branch.name}) as it is currently set as trunk.`);
    }
}
//# sourceMappingURL=stack_onto.js.map