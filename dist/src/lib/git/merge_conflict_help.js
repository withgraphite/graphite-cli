"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printStatus = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function printStatus() {
    exec_sync_1.gpExecSync({
        command: `git status`,
        options: {
            printStdout: (out) => out.replace('git rebase --continue', 'gt continue'),
        },
    });
}
exports.printStatus = printStatus;
//# sourceMappingURL=merge_conflict_help.js.map