"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = void 0;
const errors_1 = require("../../lib/errors");
const checkout_branch_1 = require("../../lib/git/checkout_branch");
const get_remote_branch_names_1 = require("../../lib/git/get_remote_branch_names");
const preconditions_1 = require("../../lib/preconditions");
const exec_sync_1 = require("../../lib/utils/exec_sync");
const trunk_1 = require("../../lib/utils/trunk");
function pull(args, context) {
    const { oldBranchName, branchesToFetch } = args;
    context.splog.logInfo(`Pulling in new changes...`);
    context.splog.logTip(`Disable this behavior at any point in the future with --no-pull`);
    const remote = context.repoConfig.getRemote();
    const trunk = trunk_1.getTrunk(context).name;
    if (preconditions_1.currentBranchPrecondition(context).name !== trunk) {
        throw new errors_1.PreconditionsFailedError('Must be on trunk to pull');
    }
    exec_sync_1.gpExecSync({ command: `git remote prune ${remote}` });
    const input = get_remote_branch_names_1.getRemoteBranchNames(context)
        .filter((name) => branchesToFetch.includes(name))
        .join('\n');
    context.splog.logDebug(`Fetching branches:\n${input}`);
    exec_sync_1.gpExecSync({
        command: `git fetch ${remote} --stdin --no-write-fetch-head`,
        options: { input },
    }, (err) => {
        checkout_branch_1.checkoutBranch(oldBranchName, { quiet: true });
        throw new errors_1.ExitFailedError(`Failed to fetch from remote ${remote}`, err);
    });
    exec_sync_1.gpExecSync({ command: `git merge --ff-only "refs/remotes/${remote}/${trunk}"` }, (err) => {
        checkout_branch_1.checkoutBranch(oldBranchName, { quiet: true });
        throw new errors_1.ExitFailedError(`Failed to fast-forward trunk ${trunk}`, err);
    });
    context.splog.logNewline();
}
exports.pull = pull;
//# sourceMappingURL=pull.js.map