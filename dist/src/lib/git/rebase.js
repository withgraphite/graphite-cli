"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebaseInteractive = exports.rebaseAbort = exports.rebaseContinue = exports.rebase = void 0;
const run_command_1 = require("../utils/run_command");
const rebase_in_progress_1 = require("./rebase_in_progress");
function rebase(args) {
    return rebaseInternal({
        args: [
            ...(args.restackCommitterDateIsAuthorDate
                ? [`--committer-date-is-author-date`]
                : []),
            `--onto`,
            args.onto,
            args.from,
            args.branchName,
        ],
        resource: 'rebase',
    });
}
exports.rebase = rebase;
function rebaseContinue() {
    return rebaseInternal({
        args: ['--continue'],
        options: {
            env: { ...process.env, GIT_EDITOR: 'true' },
        },
        resource: 'rebaseContinue',
    });
}
exports.rebaseContinue = rebaseContinue;
function rebaseAbort() {
    (0, run_command_1.runGitCommand)({
        args: [`rebase`, `--abort`],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'rebaseAbort',
    });
}
exports.rebaseAbort = rebaseAbort;
function rebaseInteractive(args) {
    return rebaseInternal({
        args: [`-i`, args.parentBranchRevision, args.branchName],
        resource: 'rebaseInteractive',
    });
}
exports.rebaseInteractive = rebaseInteractive;
function rebaseInternal(params) {
    try {
        (0, run_command_1.runGitCommand)({
            args: ['rebase', ...params.args],
            options: { stdio: 'pipe', ...params.options },
            onError: 'throw',
            resource: params.resource,
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