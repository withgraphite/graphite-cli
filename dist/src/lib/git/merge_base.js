"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMergeBase = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function getMergeBase(left, right) {
    return (0, exec_sync_1.gpExecSync)({
        command: `git merge-base ${(0, escape_for_shell_1.q)(left)} ${(0, escape_for_shell_1.q)(right)}`,
    });
}
exports.getMergeBase = getMergeBase;
//# sourceMappingURL=merge_base.js.map