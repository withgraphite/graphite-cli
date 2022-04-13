"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectStagedChanges = void 0;
const child_process_1 = require("child_process");
function detectStagedChanges() {
    try {
        child_process_1.execSync(`git diff --no-ext-diff --cached --exit-code`);
    }
    catch (_a) {
        return true;
    }
    // Diff succeeds if there are no staged changes.
    return false;
}
exports.detectStagedChanges = detectStagedChanges;
//# sourceMappingURL=detect_staged_changes.js.map