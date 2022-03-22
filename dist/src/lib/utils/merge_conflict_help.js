"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printGraphiteMergeConflictStatus = void 0;
const _1 = require(".");
function printGraphiteMergeConflictStatus() {
    if (!_1.rebaseInProgress()) {
        return;
    }
    const statusOutput = _1.gpExecSync({
        command: `git status`,
    })
        .toString()
        .trim();
    const output = [
        statusOutput.replace('git rebase --continue', 'gt continue'),
    ].join('\n');
    _1.logInfo(output);
}
exports.printGraphiteMergeConflictStatus = printGraphiteMergeConflictStatus;
//# sourceMappingURL=merge_conflict_help.js.map