"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchExists = void 0;
const child_process_1 = require("child_process");
function branchExists(branchName) {
    try {
        child_process_1.execSync(`git show-ref --quiet refs/heads/${branchName}`, {
            stdio: 'ignore',
        });
    }
    catch (_a) {
        return false;
    }
    return true;
}
exports.branchExists = branchExists;
//# sourceMappingURL=branch_exists.js.map