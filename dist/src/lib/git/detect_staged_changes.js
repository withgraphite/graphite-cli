"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectStagedChanges = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function detectStagedChanges() {
    return (exec_sync_1.gpExecSync({
        command: `git diff --no-ext-diff --cached`,
    }).length > 0);
}
exports.detectStagedChanges = detectStagedChanges;
//# sourceMappingURL=detect_staged_changes.js.map