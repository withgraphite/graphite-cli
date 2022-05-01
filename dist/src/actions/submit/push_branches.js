"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBranchesToRemote = void 0;
const chalk_1 = __importDefault(require("chalk"));
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
function pushBranchesToRemote(branches, context) {
    utils_1.logInfo(chalk_1.default.blueBright('➡️  [Step 3] Pushing branches to remote...'));
    if (!branches.length) {
        utils_1.logInfo(`No eligible branches to push.`);
        utils_1.logNewline();
        return [];
    }
    return branches
        .map((branch) => {
        utils_1.logInfo(`Pushing ${chalk_1.default.cyan(branch.name)} with --force-with-lease (will not override external commits to remote)...`);
        return utils_1.gpExecSync({
            // redirecting stderr to stdout here because 1) git prints the output
            // of the push command to stderr 2) we want to analyze it but Node's
            // execSync makes analyzing stderr extremely challenging
            command: [
                `git push ${context.repoConfig.getRemote()}`,
                `--force-with-lease ${branch.name} 2>&1`,
                ...[exec_state_config_1.execStateConfig.noVerify() ? ['--no-verify'] : []],
            ].join(' '),
            options: {
                printStdout: (output) => output
                    .split('\n')
                    .filter((line) => !line.startsWith('remote:'))
                    .join('\n'),
            },
        }, (err) => {
            utils_1.logError(`Failed to push changes for ${branch.name} to remote.`);
            utils_1.logTip(`There may be external commits on remote that were not overwritten with the attempted push.
          \n Use 'git pull' to pull external changes and retry.`, context);
            throw new errors_1.ExitFailedError(err.stderr.toString());
        })
            .toString()
            .trim()
            .includes('Everything up-to-date')
            ? undefined
            : branch;
    })
        .filter((b) => b !== undefined);
}
exports.pushBranchesToRemote = pushBranchesToRemote;
//# sourceMappingURL=push_branches.js.map