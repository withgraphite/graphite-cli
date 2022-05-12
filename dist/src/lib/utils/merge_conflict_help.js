"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printGraphiteMergeConflictStatus = void 0;
const exec_sync_1 = require("./exec_sync");
const rebase_in_progress_1 = require("./rebase_in_progress");
const splog_1 = require("./splog");
function printGraphiteMergeConflictStatus() {
    if (!rebase_in_progress_1.rebaseInProgress()) {
        return;
    }
    const statusOutput = exec_sync_1.gpExecSync({
        command: `git status`,
    })
        .toString()
        .trim();
    const output = [
        statusOutput.replace('git rebase --continue', 'gt continue'),
    ].join('\n');
    splog_1.logInfo(output);
}
exports.printGraphiteMergeConflictStatus = printGraphiteMergeConflictStatus;
//# sourceMappingURL=merge_conflict_help.js.map