"use strict";
exports.__esModule = true;
exports.detectStagedChanges = void 0;
var child_process_1 = require("child_process");
function detectStagedChanges() {
    try {
        child_process_1.execSync("git diff --cached --exit-code");
    }
    catch (_a) {
        return true;
    }
    // Diff succeeds if there are no staged changes.
    return false;
}
exports.detectStagedChanges = detectStagedChanges;
