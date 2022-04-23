"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = void 0;
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const utils_1 = require("../../lib/utils");
function pull(context, oldBranchName) {
    utils_1.logInfo(`Pulling in new changes...`);
    utils_1.logTip(`Disable this behavior at any point in the future with --no-pull`, context);
    const remote = context.repoConfig.getRemote();
    const trunk = utils_1.getTrunk(context).name;
    if (preconditions_1.currentBranchPrecondition(context).name !== trunk) {
        throw new errors_1.PreconditionsFailedError('Must be on trunk to pull');
    }
    utils_1.gpExecSync({ command: `git remote prune ${remote}` });
    utils_1.gpExecSync({
        command: `git fetch ${remote} "+refs/heads/*:refs/remotes/${remote}/*"${context.userConfig.data.multiplayerEnabled
            ? ` "+refs/branch-metadata/*:refs/${remote}-branch-metadata/*"`
            : ''}`,
    }, (err) => {
        utils_1.checkoutBranch(oldBranchName);
        throw new errors_1.ExitFailedError(`Failed to fetch from remote ${remote}`, err);
    });
    utils_1.gpExecSync({ command: `git merge --ff-only "refs/remotes/${remote}/${trunk}"` }, (err) => {
        utils_1.checkoutBranch(oldBranchName);
        throw new errors_1.ExitFailedError(`Failed to fast-forward trunk ${trunk}`, err);
    });
    utils_1.logNewline();
}
exports.pull = pull;
//# sourceMappingURL=pull.js.map