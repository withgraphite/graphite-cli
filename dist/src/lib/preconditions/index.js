"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliAuthPrecondition = exports.ensureSomeStagedChangesPrecondition = exports.currentGitRepoPrecondition = exports.uncommittedChangesPrecondition = exports.uncommittedTrackedChangesPrecondition = exports.branchExistsPrecondition = exports.currentBranchPrecondition = void 0;
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const config_1 = require("../config");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const git_status_utils_1 = require("../utils/git_status_utils");
function addAllAvailableTip() {
    if (utils_1.unstagedChanges()) {
        utils_1.logTip('There are unstaged changes. Use -a option to stage all unstaged changes.');
    }
}
function currentBranchPrecondition() {
    const branch = branch_1.default.getCurrentBranch();
    if (!branch) {
        throw new errors_1.PreconditionsFailedError(`Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`);
    }
    if (config_1.repoConfig.branchIsIgnored(branch.name)) {
        throw new errors_1.PreconditionsFailedError([
            `Cannot use graphite atop (${branch.name}) which is explicitly ignored in your repo config.`,
            `If you'd like to edit your ignored branches, consider running "gt repo ignored-branches --help" for options, or manually editing your ".git/.graphite_repo_config" file.`,
        ].join('\n'));
    }
    return branch;
}
exports.currentBranchPrecondition = currentBranchPrecondition;
function branchExistsPrecondition(branchName) {
    if (!branch_1.default.exists(branchName)) {
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
function uncommittedChangesPrecondition() {
    if (utils_1.uncommittedChanges()) {
        throw new errors_1.PreconditionsFailedError(`Cannot run with untracked or uncommitted changes present, please resolve and then retry.`);
    }
}
exports.uncommittedChangesPrecondition = uncommittedChangesPrecondition;
function ensureSomeStagedChangesPrecondition(addAllLogTipEnabled) {
    if (!utils_1.detectStagedChanges()) {
        utils_1.gpExecSync({ command: `git status`, options: { stdio: 'ignore' } });
        if (addAllLogTipEnabled) {
            addAllAvailableTip();
        }
        throw new errors_1.PreconditionsFailedError(`Cannot run without staged changes.`);
    }
}
exports.ensureSomeStagedChangesPrecondition = ensureSomeStagedChangesPrecondition;
function cliAuthPrecondition() {
    const token = config_1.userConfig.getAuthToken();
    if (!token || token.length === 0) {
        throw new errors_1.PreconditionsFailedError('Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.');
    }
    return token;
}
exports.cliAuthPrecondition = cliAuthPrecondition;
function currentGitRepoPrecondition() {
    const repoRootPath = utils_1.gpExecSync({
        command: `git rev-parse --show-toplevel`,
    }, () => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError('No .git repository found.');
    }
    return repoRootPath;
}
exports.currentGitRepoPrecondition = currentGitRepoPrecondition;
//# sourceMappingURL=index.js.map