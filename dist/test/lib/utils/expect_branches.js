"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectBranches = void 0;
const chai_1 = require("chai");
const child_process_1 = require("child_process");
function expectBranches(repo, sortedBranches) {
    (0, chai_1.expect)((0, child_process_1.execSync)(`git -C "${repo.dir}" for-each-ref refs/heads/ "--format=%(refname:short)"`)
        .toString()
        .trim()
        .split('\n')
        .filter((b) => b !== 'prod') // scene related branch
        .filter((b) => b !== 'x2') // scene related branch
        .sort()
        .join(', ')).to.equal(sortedBranches);
}
exports.expectBranches = expectBranches;
//# sourceMappingURL=expect_branches.js.map