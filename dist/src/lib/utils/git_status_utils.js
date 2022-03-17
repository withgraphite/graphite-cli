"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedUncommittedChanges = exports.unstagedChanges = exports.uncommittedChanges = void 0;
const _1 = require(".");
const errors_1 = require("../errors");
function doChangesExist(cmd) {
    return (_1.gpExecSync({
        command: cmd,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for untracked/uncommitted changes.`);
    })
        .toString()
        .trim() !== '0');
}
function uncommittedChanges() {
    return doChangesExist(`git status -u --porcelain=v1 2>/dev/null | wc -l`); // Includes untracked and staged changes
}
exports.uncommittedChanges = uncommittedChanges;
function unstagedChanges() {
    return doChangesExist(`git ls-files --others --exclude-standard | wc -l`); // untracked changes only
}
exports.unstagedChanges = unstagedChanges;
function trackedUncommittedChanges() {
    return doChangesExist(`git status -uno --porcelain=v1 2>/dev/null | wc -l`); // staged but uncommitted changes only
}
exports.trackedUncommittedChanges = trackedUncommittedChanges;
//# sourceMappingURL=git_status_utils.js.map