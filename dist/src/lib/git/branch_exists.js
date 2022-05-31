"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchExists = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function branchExists(branchName) {
    return (exec_sync_1.gpExecSync({
        command: `git show-ref refs/heads/${branchName}`,
    }).length > 0);
}
exports.branchExists = branchExists;
//# sourceMappingURL=branch_exists.js.map