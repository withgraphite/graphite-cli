"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliAuthPrecondition = exports.ensureSomeStagedChangesPrecondition = exports.currentGitRepoPrecondition = exports.uncommittedTrackedChangesPrecondition = exports.getRepoRootPathPrecondition = void 0;
const errors_1 = require("./errors");
const diff_1 = require("./git/diff");
const git_status_utils_1 = require("./git/git_status_utils");
const exec_sync_1 = require("./utils/exec_sync");
function getRepoRootPathPrecondition() {
    const repoRootPath = (0, exec_sync_1.gpExecSync)({
        command: `git rev-parse --git-common-dir`,
    });
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    return repoRootPath;
}
exports.getRepoRootPathPrecondition = getRepoRootPathPrecondition;
function uncommittedTrackedChangesPrecondition() {
    if ((0, git_status_utils_1.trackedUncommittedChanges)()) {
        throw new errors_1.PreconditionsFailedError(`There are tracked changes that have not been committed. Please resolve and then retry.`);
    }
}
exports.uncommittedTrackedChangesPrecondition = uncommittedTrackedChangesPrecondition;
function ensureSomeStagedChangesPrecondition(context) {
    if ((0, diff_1.detectStagedChanges)()) {
        return;
    }
    if ((0, git_status_utils_1.unstagedChanges)()) {
        context.splog.tip('There are unstaged changes. Use the `--all` option to stage all changes.');
    }
    throw new errors_1.PreconditionsFailedError(`Cannot run without staged changes.`);
}
exports.ensureSomeStagedChangesPrecondition = ensureSomeStagedChangesPrecondition;
function cliAuthPrecondition(context) {
    const token = context.userConfig.data.authToken;
    if (!token || token.length === 0) {
        throw new errors_1.PreconditionsFailedError('Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.');
    }
    return token;
}
exports.cliAuthPrecondition = cliAuthPrecondition;
function currentGitRepoPrecondition() {
    const repoRootPath = (0, exec_sync_1.gpExecSync)({
        command: `git rev-parse --show-toplevel`,
    });
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    return repoRootPath;
}
exports.currentGitRepoPrecondition = currentGitRepoPrecondition;
//# sourceMappingURL=preconditions.js.map