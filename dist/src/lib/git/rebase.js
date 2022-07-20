"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInteractive = exports.rebaseAbort = exports.rebaseContinue = exports.rebase = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
const rebase_in_progress_1 = require("./rebase_in_progress");
function rebase(args) {
    return rebaseInternal(`git rebase ${args.restackCommitterDateIsAuthorDate
        ? `--committer-date-is-author-date`
        : ''}--onto ${(0, escape_for_shell_1.q)(args.onto)} ${(0, escape_for_shell_1.q)(args.from)} ${(0, escape_for_shell_1.q)(args.branchName)}`);
}
exports.rebase = rebase;
function rebaseContinue() {
    return rebaseInternal(`GIT_EDITOR=true git rebase --continue`);
}
exports.rebaseContinue = rebaseContinue;
function rebaseAbort() {
    (0, exec_sync_1.gpExecSync)({
        command: `git rebase --abort`,
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.rebaseAbort = rebaseAbort;
function rebaseInteractive(args) {
    return rebaseInternal(`git rebase -i ${(0, escape_for_shell_1.q)(args.parentBranchRevision)} ${(0, escape_for_shell_1.q)(args.branchName)}`);
}
exports.rebaseInteractive = rebaseInteractive;
function rebaseInternal(command) {
    try {
        (0, exec_sync_1.gpExecSync)({
            command,
            options: { stdio: 'pipe' },
            onError: 'throw',
        });
    }
    catch (e) {
        if ((0, rebase_in_progress_1.rebaseInProgress)()) {
            return 'REBASE_CONFLICT';
        }
        else {
            throw e;
        }
    }
    return 'REBASE_DONE';
}
//# sourceMappingURL=rebase.js.map