"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedUncommittedChanges = exports.unstagedChanges = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function doChangesExist(cmd) {
    return (exec_sync_1.gpExecSync({
        command: cmd,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for untracked/uncommitted changes.`);
    }).length > 0);
}
function unstagedChanges() {
    return doChangesExist(`git ls-files --others --exclude-standard`); // untracked changes only
}
exports.unstagedChanges = unstagedChanges;
function trackedUncommittedChanges() {
    return doChangesExist(`git status -uno --porcelain=v1 2>/dev/null`); // staged but uncommitted changes only
}
exports.trackedUncommittedChanges = trackedUncommittedChanges;
//# sourceMappingURL=git_status_utils.js.map