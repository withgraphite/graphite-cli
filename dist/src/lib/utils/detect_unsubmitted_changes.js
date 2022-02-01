"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectUnsubmittedChanges = void 0;
const exec_sync_1 = require("./exec_sync");
const errors_1 = require("../errors");
function detectUnsubmittedChanges(branch) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git log ${branch.name} --not --remotes --simplify-by-decoration --decorate --oneline`,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for untracked/uncommitted changes.`);
    })
        .toString()
        .trim().length !== 0);
}
exports.detectUnsubmittedChanges = detectUnsubmittedChanges;
//# sourceMappingURL=detect_unsubmitted_changes.js.map