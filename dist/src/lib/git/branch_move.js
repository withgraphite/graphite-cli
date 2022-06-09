"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchMove = void 0;
const errors_1 = require("../errors");
const exec_sync_1 = require("../utils/exec_sync");
function branchMove(newName) {
    (0, exec_sync_1.gpExecSync)({ command: `git branch -m ${newName}` }, (err) => {
        throw new errors_1.ExitFailedError(`Failed to rename the current branch.`, err);
    });
}
exports.branchMove = branchMove;
//# sourceMappingURL=branch_move.js.map