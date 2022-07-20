"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBranch = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function pushBranch(opts) {
    const forceOption = opts.forcePush ? '--force' : '--force-with-lease';
    (0, exec_sync_1.gpExecSync)({
        command: [
            `git push -u`,
            (0, escape_for_shell_1.q)(opts.remote),
            forceOption,
            (0, escape_for_shell_1.q)(opts.branchName),
            ...[opts.noVerify ? ['--no-verify'] : []],
        ].join(' '),
        options: { stdio: 'pipe' },
        onError: 'throw',
    });
}
exports.pushBranch = pushBranch;
//# sourceMappingURL=push_branch.js.map