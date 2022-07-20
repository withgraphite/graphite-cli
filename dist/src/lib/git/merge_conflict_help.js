"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRebaseHead = exports.getUnmergedFiles = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getUnmergedFiles() {
    return (0, exec_sync_1.gpExecSyncAndSplitLines)({
        command: `git --no-pager diff --no-ext-diff --name-only --diff-filter=U`,
        onError: 'throw',
    });
}
exports.getUnmergedFiles = getUnmergedFiles;
function getRebaseHead() {
    return (0, exec_sync_1.gpExecSync)({
        command: `cat $(git rev-parse --git-dir)/rebase-merge/head-name`,
        onError: 'throw',
    }).slice('refs/heads/'.length);
}
exports.getRebaseHead = getRebaseHead;
//# sourceMappingURL=merge_conflict_help.js.map