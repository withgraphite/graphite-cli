"use strict";
exports.__esModule = true;
exports.detectUnsubmittedChanges = void 0;
var exec_sync_1 = require("./exec_sync");
var errors_1 = require("../errors");
function detectUnsubmittedChanges(branch) {
    return (exec_sync_1.gpExecSync({
        command: "git log " + branch.name + " --not --remotes --simplify-by-decoration --decorate --oneline"
    }, function () {
        throw new errors_1.ExitFailedError("Failed to check current dir for untracked/uncommitted changes.");
    })
        .toString()
        .trim().length !== 0);
}
exports.detectUnsubmittedChanges = detectUnsubmittedChanges;
