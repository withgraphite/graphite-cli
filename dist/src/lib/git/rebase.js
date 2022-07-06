"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInteractive = exports.rebaseAbort = exports.rebaseContinue = exports.rebase = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
const rebase_in_progress_1 = require("./rebase_in_progress");
function rebase(args) {
    (0, exec_sync_1.gpExecSync)({
        command: `git rebase ${args.restackCommitterDateIsAuthorDate
            ? `--committer-date-is-author-date`
            : ''}--onto ${(0, escape_for_shell_1.q)(args.onto)} ${(0, escape_for_shell_1.q)(args.from)} ${(0, escape_for_shell_1.q)(args.branchName)}`,
        options: { stdio: 'ignore' },
    });
    return (0, rebase_in_progress_1.rebaseInProgress)() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}
exports.rebase = rebase;
function rebaseContinue() {
    (0, exec_sync_1.gpExecSync)({
        command: `GIT_EDITOR=true git rebase --continue`,
        options: { stdio: 'ignore' },
    });
    return (0, rebase_in_progress_1.rebaseInProgress)() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}
exports.rebaseContinue = rebaseContinue;
function rebaseAbort() {
    (0, exec_sync_1.gpExecSync)({
        command: `git rebase --abort`,
        options: { stdio: 'ignore' },
    });
}
exports.rebaseAbort = rebaseAbort;
function rebaseInteractive(args) {
    (0, exec_sync_1.gpExecSync)({
        command: `git rebase -i ${(0, escape_for_shell_1.q)(args.parentBranchRevision)} ${(0, escape_for_shell_1.q)(args.branchName)}`,
        options: { stdio: 'inherit' },
    });
    return (0, rebase_in_progress_1.rebaseInProgress)() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}
exports.rebaseInteractive = rebaseInteractive;
//# sourceMappingURL=rebase.js.map