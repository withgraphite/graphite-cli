"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyBranch = void 0;
const child_process_1 = require("child_process");
function isEmptyBranch(branchName, parentName) {
    try {
        child_process_1.execSync(`git diff --no-ext-diff --exit-code ${parentName} ${branchName} -- `);
    }
    catch (_a) {
        return false;
    }
    return true;
}
exports.isEmptyBranch = isEmptyBranch;
//# sourceMappingURL=is_empty_branch.js.map