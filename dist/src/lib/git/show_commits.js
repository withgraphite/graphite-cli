"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCommits = void 0;
const escape_for_shell_1 = require("../utils/escape_for_shell");
const exec_sync_1 = require("../utils/exec_sync");
function showCommits(base, head, patch) {
    (0, exec_sync_1.gpExecSync)({
        command: `git --no-pager log ${patch ? '-p' : ''} ${(0, escape_for_shell_1.q)(base)}..${(0, escape_for_shell_1.q)(head)} --`,
        options: { stdio: 'inherit' },
        onError: 'throw',
    });
}
exports.showCommits = showCommits;
//# sourceMappingURL=show_commits.js.map