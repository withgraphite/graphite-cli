"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectCommits = void 0;
const chai_1 = require("chai");
function expectCommits(repo, commitMessages) {
    (0, chai_1.expect)(repo
        .listCurrentBranchCommitMessages()
        .slice(0, commitMessages.split(',').length)
        .join(', ')).to.equal(commitMessages);
}
exports.expectCommits = expectCommits;
//# sourceMappingURL=expect_commits.js.map