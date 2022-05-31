"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.push = void 0;
const errors_1 = require("../../lib/errors");
const exec_sync_1 = require("../../lib/utils/exec_sync");
function push(branch, context) {
    exec_sync_1.gpExecSync({
        command: [
            `git push ${context.repoConfig.getRemote()}`,
            `--force-with-lease ${branch.name} 2>&1`,
            ...[context.noVerify ? ['--no-verify'] : []],
        ].join(' '),
    }, (err) => {
        context.splog.logError(`Failed to push changes for ${branch.name} to remote.`);
        context.splog.logTip(`There may be external commits on remote that were not overwritten with the attempted push.
      \n Use 'git pull' to pull external changes and retry.`);
        throw new errors_1.ExitFailedError(err.stdout.toString());
    });
}
exports.push = push;
//# sourceMappingURL=push_branch.js.map