"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedUncommittedChanges = exports.unstagedChanges = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function doChangesExist(cmd) {
    return ((0, exec_sync_1.gpExecSync)({
        command: cmd,
        onError: 'throw',
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