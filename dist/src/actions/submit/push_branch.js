"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.push = void 0;
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const splog_1 = require("../../lib/utils/splog");
function push(branch, context) {
    exec_sync_1.gpExecSync({
        command: [
            `git push ${context.repoConfig.getRemote()}`,
            `--force-with-lease ${branch.name} 2>&1`,
            ...[exec_state_config_1.execStateConfig.noVerify() ? ['--no-verify'] : []],
        ].join(' '),
    }, (err) => {
        splog_1.logError(`Failed to push changes for ${branch.name} to remote.`);
        splog_1.logTip(`There may be external commits on remote that were not overwritten with the attempted push.
      \n Use 'git pull' to pull external changes and retry.`, context);
        throw new errors_1.ExitFailedError(err.stderr.toString());
    });
}
exports.push = push;
//# sourceMappingURL=push_branch.js.map