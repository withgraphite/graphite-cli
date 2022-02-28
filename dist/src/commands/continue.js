"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const child_process_1 = require("child_process");
const clean_branches_1 = require("../actions/clean_branches");
const edit_downstack_1 = require("../actions/edit/edit_downstack");
const fix_1 = require("../actions/fix");
const stack_onto_1 = require("../actions/onto/stack_onto");
const sync_1 = require("../actions/sync");
const merge_conflict_callstack_config_1 = require("../lib/config/merge_conflict_callstack_config");
const errors_1 = require("../lib/errors");
const telemetry_1 = require("../lib/telemetry");
const rebase_in_progress_1 = require("../lib/utils/rebase_in_progress");
const branch_1 = require("../wrapper-classes/branch");
const fix_2 = require("./repo-commands/fix");
const args = {
    edit: {
        describe: `Edit the commit message for an amended, resolved merge conflict. By default true; use --no-edit to set this to false.`,
        demandOption: false,
        default: true,
        type: 'boolean',
    },
};
exports.command = 'continue';
exports.canonical = 'continue';
exports.aliases = [];
exports.description = 'Continues the most-recent Graphite command halted by a merge conflict.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        const pendingRebase = rebase_in_progress_1.rebaseInProgress();
        const mostRecentCheckpoint = merge_conflict_callstack_config_1.getPersistedMergeConflictCallstack();
        if (!mostRecentCheckpoint && !pendingRebase) {
            throw new errors_1.PreconditionsFailedError(`No Graphite command to continue.`);
        }
        if (pendingRebase) {
            child_process_1.execSync(`${argv.edit ? '' : 'GIT_EDITOR=true'} git rebase --continue`, {
                stdio: 'inherit',
            });
        }
        if (mostRecentCheckpoint) {
            yield resolveCallstack(mostRecentCheckpoint, context);
            merge_conflict_callstack_config_1.clearPersistedMergeConflictCallstack();
        }
    }));
});
exports.handler = handler;
function resolveCallstack(callstack, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (callstack === 'TOP_OF_CALLSTACK_WITH_NOTHING_AFTER') {
            return;
        }
        switch (callstack.frame.op) {
            case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
                yield stack_onto_1.stackOntoBaseRebaseContinuation(callstack.frame, callstack.parent, context);
                break;
            case 'STACK_ONTO_FIX_CONTINUATION':
                yield stack_onto_1.stackOntoFixContinuation(callstack.frame);
                break;
            case 'STACK_FIX': {
                const branch = yield branch_1.Branch.branchWithName(callstack.frame.sourceBranchName, context);
                yield fix_1.restackBranch({
                    branch: branch,
                    mergeConflictCallstack: callstack.parent,
                }, context);
                break;
            }
            case 'STACK_FIX_ACTION_CONTINUATION':
                yield fix_1.stackFixActionContinuation(callstack.frame);
                break;
            case 'DELETE_BRANCHES_CONTINUATION':
                yield clean_branches_1.deleteMergedBranches({
                    frame: callstack.frame,
                    parent: callstack.parent,
                }, context);
                break;
            case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
                yield fix_2.branchCountSanityCheckContinuation(callstack.frame);
                break;
            case 'REPO_SYNC_CONTINUATION':
                yield sync_1.repoSyncDeleteMergedBranchesContinuation(callstack.frame, context);
                break;
            case 'STACK_EDIT_CONTINUATION':
                yield edit_downstack_1.applyStackEdits(callstack.frame.remainingEdits, context);
                break;
            default:
                assertUnreachable(callstack.frame);
        }
        yield resolveCallstack(callstack.parent, context);
    });
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg) { }
//# sourceMappingURL=continue.js.map