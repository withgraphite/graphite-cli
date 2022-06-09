"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectUnsubmittedChanges = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function detectUnsubmittedChanges(branchName) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log ${branchName} --not --remotes --simplify-by-decoration --decorate --oneline --`,
    }, () => {
        throw new errors_1.ExitFailedError(`Failed to check current dir for untracked/uncommitted changes.`);
    }).length !== 0);
}
exports.detectUnsubmittedChanges = detectUnsubmittedChanges;
//# sourceMappingURL=detect_unsubmitted_changes.js.map