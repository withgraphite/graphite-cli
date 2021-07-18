"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const git_repo_1 = __importDefault(require("../utils/git_repo"));
const misc_1 = require("../utils/misc");
describe("Next or Prev tests", function () {
    let tmpDir;
    let repo;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1");
    });
    afterEach(() => {
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(5000);
    it("Can move to the next and prev branch", () => {
        repo.createAndCheckoutBranch("a");
        repo.createChangeAndCommit("2");
        repo.createChangeAndCommit("3");
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("4");
        repo.createChangeAndCommit("5");
        repo.checkoutBranch("a");
        chai_1.expect(repo.currentBranchName()).to.equal("a");
        misc_1.execCliCommand(`next`, { fromDir: tmpDir.name });
        chai_1.expect(repo.currentBranchName()).to.equal("b");
        misc_1.execCliCommand(`prev`, { fromDir: tmpDir.name });
        chai_1.expect(repo.currentBranchName()).to.equal("a");
    });
});
//# sourceMappingURL=next_or_prev.test.js.map