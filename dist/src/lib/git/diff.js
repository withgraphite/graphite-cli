"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDiffEmpty = exports.showDiff = exports.getUnstagedChanges = exports.detectStagedChanges = exports.detectUnsubmittedChanges = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function detectUnsubmittedChanges(branchName, remote) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log --oneline ${(0, escape_for_shell_1.q)(branchName)}...${(0, escape_for_shell_1.q)(remote)}/${(0, escape_for_shell_1.q)(branchName)}`,
        onError: 'throw',
    }).length !== 0);
}
exports.detectUnsubmittedChanges = detectUnsubmittedChanges;
function detectStagedChanges() {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager diff --no-ext-diff --shortstat --cached`,
        onError: 'throw',
    }).length > 0);
}
exports.detectStagedChanges = detectStagedChanges;
function getUnstagedChanges() {
    return (0, exec_sync_1.gpExecSync)({
        command: `git -c color.ui=always --no-pager diff --no-ext-diff --stat`,
        onError: 'throw',
    });
}
exports.getUnstagedChanges = getUnstagedChanges;
function showDiff(left, right) {
    (0, exec_sync_1.gpExecSync)({
        command: `git -c color.ui=always --no-pager diff --no-ext-diff ${(0, escape_for_shell_1.q)(left)} ${(0, escape_for_shell_1.q)(right)} -- `,
        options: { stdio: 'inherit' },
        onError: 'throw',
    });
}
exports.showDiff = showDiff;
function isDiffEmpty(left, right) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager diff --no-ext-diff --shortstat ${(0, escape_for_shell_1.q)(left)} ${(0, escape_for_shell_1.q)(right)} -- `,
        onError: 'throw',
    }).length === 0);
}
exports.isDiffEmpty = isDiffEmpty;
//# sourceMappingURL=diff.js.map