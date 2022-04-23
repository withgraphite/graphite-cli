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
const sync_1 = require("../actions/sync/sync");
const errors_1 = require("../lib/errors");
const telemetry_1 = require("../lib/telemetry");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
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
        var _a, _b;
        const pendingRebase = rebase_in_progress_1.rebaseInProgress();
        const mostRecentCheckpoint = (_a = context.mergeConflictCallstackConfig) === null || _a === void 0 ? void 0 : _a.data.callstack;
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
            (_b = context.mergeConflictCallstackConfig) === null || _b === void 0 ? void 0 : _b.delete();
        }
    }));
});
exports.handler = handler;
function resolveCallstack(callstack, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (callstack.length === 0) {
            return;
        }
        const frame = callstack[0];
        const remaining = callstack.slice(1);
        switch (frame.op) {
            case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
                yield stack_onto_1.stackOntoBaseRebaseContinuation(frame, remaining, context);
                break;
            case 'STACK_ONTO_FIX_CONTINUATION':
                yield stack_onto_1.stackOntoFixContinuation(frame);
                break;
            case 'STACK_FIX': {
                const branch = yield branch_1.Branch.branchWithName(frame.sourceBranchName, context);
                yield fix_1.restackBranch({
                    branch: branch,
                    mergeConflictCallstack: remaining,
                }, context);
                break;
            }
            case 'STACK_FIX_ACTION_CONTINUATION':
                yield fix_1.stackFixActionContinuation(frame);
                break;
            case 'DELETE_BRANCHES_CONTINUATION':
                yield clean_branches_1.deleteMergedBranches({
                    frame: frame,
                    parent: remaining,
                }, context);
                break;
            case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
                fix_2.deleteMergedBranchesContinuation();
                break;
            case 'REPO_SYNC_CONTINUATION':
                yield sync_1.repoSyncDeleteMergedBranchesContinuation(frame, context);
                break;
            case 'STACK_EDIT_CONTINUATION':
                yield edit_downstack_1.applyStackEdits(frame.remainingEdits, context);
                break;
            default:
                assert_unreachable_1.assertUnreachable(frame);
        }
        yield resolveCallstack(remaining, context);
    });
}
//# sourceMappingURL=continue.js.map