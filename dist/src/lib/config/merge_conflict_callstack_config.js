"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistMergeConflictCallstack = exports.mergeConflictCallstackConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const stack_edits_1 = require("./../../actions/edit/stack_edits");
const compose_config_1 = require("./compose_config");
/**
 * After Graphite is interrupted by a merge conflict, upon continuing, there
 * are 2 main things we need to do.
 *
 * 1) Complete the original rebase operation.
 * 2) Perform any needed follow-up actions that were supposed to occur after
 *    the rebase in the original callstack.
 *
 * The below object helps keep track of these items and persist them across
 * invocations of the CLI.
 */
const StackEditStackFrameSchema = t.shape({
    op: t.literal('STACK_EDIT_CONTINUATION'),
    currentBranchName: t.string,
    remainingEdits: t.array(stack_edits_1.StackedEditPickSchema),
});
const StackOntoBaseRebaseStackFrameSchema = t.shape({
    op: t.literal('STACK_ONTO_BASE_REBASE_CONTINUATION'),
    currentBranchName: t.string,
    onto: t.string,
});
const StackOntoFixStackFrameSchema = t.shape({
    op: t.literal('STACK_ONTO_FIX_CONTINUATION'),
    currentBranchName: t.string,
    onto: t.string,
});
const StackFixActionStackFrameSchema = t.shape({
    op: t.literal('STACK_FIX_ACTION_CONTINUATION'),
    checkoutBranchName: t.string,
});
const RestackNodeStackFrameSchema = t.shape({
    op: t.literal('STACK_FIX'),
    sourceBranchName: t.string,
});
const DeleteBranchesStackFrameSchema = t.shape({
    op: t.literal('DELETE_BRANCHES_CONTINUATION'),
    force: t.boolean,
    showDeleteProgress: t.boolean,
});
const RepoFixBranchCountSanityCheckStackFrameSchema = t.shape({
    op: t.literal('REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION'),
});
const RepoSyncStackFrameSchema = t.shape({
    op: t.literal('REPO_SYNC_CONTINUATION'),
    force: t.boolean,
    resubmit: t.boolean,
    oldBranchName: t.string,
});
const GraphiteFrameSchema = t.unionMany([
    StackOntoBaseRebaseStackFrameSchema,
    StackOntoFixStackFrameSchema,
    StackFixActionStackFrameSchema,
    RestackNodeStackFrameSchema,
    DeleteBranchesStackFrameSchema,
    RepoFixBranchCountSanityCheckStackFrameSchema,
    RepoSyncStackFrameSchema,
    StackEditStackFrameSchema,
]);
const MergeConflictCallstackSchema = t.shape({
    callstack: t.array(GraphiteFrameSchema),
});
exports.mergeConflictCallstackConfigFactory = compose_config_1.composeConfig({
    schema: MergeConflictCallstackSchema,
    defaultLocations: [
        {
            relativePath: '.graphite_merge_conflict',
            relativeTo: 'REPO',
        },
    ],
    initialize: () => {
        return { callstack: [] };
    },
    helperFunctions: (data, update) => {
        return {};
    },
    options: { removeIfEmpty: true, removeIfInvalid: true },
});
function persistMergeConflictCallstack(callstack, context) {
    if (!context.mergeConflictCallstackConfig) {
        context.mergeConflictCallstackConfig =
            exports.mergeConflictCallstackConfigFactory.load();
    }
    context.mergeConflictCallstackConfig.update((data) => (data.callstack = callstack));
}
exports.persistMergeConflictCallstack = persistMergeConflictCallstack;
//# sourceMappingURL=merge_conflict_callstack_config.js.map