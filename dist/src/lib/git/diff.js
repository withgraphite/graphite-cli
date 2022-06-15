"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDiffEmpty = exports.detectStagedChanges = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function detectStagedChanges() {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager diff --no-ext-diff --shortstat --cached`,
    }).length > 0);
}
exports.detectStagedChanges = detectStagedChanges;
function isDiffEmpty(left, right) {
    return ((0, exec_sync_1.gpExecSync)({
        command: `git --no-pager diff --no-ext-diff --shortstat ${(0, escape_for_shell_1.q)(left)} ${(0, escape_for_shell_1.q)(right)} -- `,
    }).length === 0);
}
exports.isDiffEmpty = isDiffEmpty;
//# sourceMappingURL=diff.js.map