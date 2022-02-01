"use strict";
exports.__esModule = true;
exports.printGraphiteMergeConflictStatus = void 0;
var _1 = require(".");
function printGraphiteMergeConflictStatus() {
    if (!_1.rebaseInProgress()) {
        return;
    }
    var statusOutput = _1.gpExecSync({
        command: "git status"
    })
        .toString()
        .trim();
    var output = [
        statusOutput.replace('git rebase --continue', 'gt continue'),
    ].join('\n');
    _1.logInfo(output);
}
exports.printGraphiteMergeConflictStatus = printGraphiteMergeConflictStatus;
