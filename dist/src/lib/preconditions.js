"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliAuthPrecondition = exports.ensureSomeStagedChangesPrecondition = exports.currentGitRepoPrecondition = exports.uncommittedTrackedChangesPrecondition = exports.branchExistsPrecondition = exports.currentBranchPrecondition = exports.getRepoRootPathPrecondition = void 0;
const branch_1 = require("../wrapper-classes/branch");
const errors_1 = require("./errors");
const branch_exists_1 = require("./git/branch_exists");
const detect_staged_changes_1 = require("./git/detect_staged_changes");
const git_status_utils_1 = require("./git/git_status_utils");
const exec_sync_1 = require("./utils/exec_sync");
function getRepoRootPathPrecondition() {
    const repoRootPath = exec_sync_1.gpExecSync({
        command: `git rev-parse --git-common-dir`,
    });
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    return repoRootPath;
}
exports.getRepoRootPathPrecondition = getRepoRootPathPrecondition;
function currentBranchPrecondition(context) {
    const branch = branch_1.Branch.currentBranch();
    if (!branch) {
        throw new errors_1.PreconditionsFailedError(`Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`);
    }
    if (context.repoConfig.branchIsIgnored(branch.name)) {
        throw new errors_1.PreconditionsFailedError([
            `Cannot use graphite atop (${branch.name}) which is explicitly ignored in your repo config.`,
            `If you'd like to edit your ignored branches, consider running "gt repo ignored-branches --help" for options, or manually editing your ".git/.graphite_repo_config" file.`,
        ].join('\n'));
    }
    return branch;
}
exports.currentBranchPrecondition = currentBranchPrecondition;
function branchExistsPrecondition(branchName) {
    if (!branch_exists_1.branchExists(branchName)) {
        throw new errors_1.PreconditionsFailedError(`Cannot find branch named: (${branchName}).`);
    }
}
exports.branchExistsPrecondition = branchExistsPrecondition;
function uncommittedTrackedChangesPrecondition() {
    if (git_status_utils_1.trackedUncommittedChanges()) {
        throw new errors_1.PreconditionsFailedError(`There are tracked changes that have not been committed. Please resolve and then retry.`);
    }
}
exports.uncommittedTrackedChangesPrecondition = uncommittedTrackedChangesPrecondition;
function ensureSomeStagedChangesPrecondition(context) {
    if (detect_staged_changes_1.detectStagedChanges()) {
        return;
    }
    if (git_status_utils_1.unstagedChanges()) {
        context.splog.logTip('There are unstaged changes. Use -a option to stage all unstaged changes.');
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
    const repoRootPath = exec_sync_1.gpExecSync({
        command: `git rev-parse --show-toplevel`,
    });
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    return repoRootPath;
}
exports.currentGitRepoPrecondition = currentGitRepoPrecondition;
//# sourceMappingURL=preconditions.js.map