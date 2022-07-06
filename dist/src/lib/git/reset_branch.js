"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softReset = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function softReset(sha) {
    (0, exec_sync_1.gpExecSync)({
        command: `git reset --soft ${(0, escape_for_shell_1.q)(sha)}`,
    });
}
exports.softReset = softReset;
//# sourceMappingURL=reset_branch.js.map