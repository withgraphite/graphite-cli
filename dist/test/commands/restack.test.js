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
describe("Restack", function () {
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
    it("Can restack a stack of three branches", () => {
        repo.createChange("2");
        misc_1.execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });
        repo.createChangeAndCommit("2.5");
        repo.createChange("3");
        misc_1.execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });
        repo.createChangeAndCommit("3.5");
        repo.createChange("4");
        misc_1.execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1");
        repo.checkoutBranch("main");
        repo.createChangeAndCommit("1.5");
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("1.5, 1");
        misc_1.execCliCommand("restack -s", { fromDir: tmpDir.name });
        // Expect restacking not to change the current checked out branch.
        chai_1.expect(repo.currentBranchName()).to.equal("main");
        repo.checkoutBranch("c");
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 3.5, 3, 2.5, 2, 1.5, 1");
    });
    it("Can restack a stack onto another", () => {
        repo.createChange("2");
        misc_1.execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });
        repo.createChange("3");
        misc_1.execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });
        repo.checkoutBranch("main");
        repo.createChange("4");
        misc_1.execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 1");
        misc_1.execCliCommand("restack -s --onto b", { fromDir: tmpDir.name });
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 3, 2, 1");
        chai_1.expect(() => misc_1.execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
            .throw;
    });
    it("Can restack a leaf stack onto main", () => {
        repo.createChange("2");
        misc_1.execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });
        repo.createChange("3");
        misc_1.execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });
        misc_1.execCliCommand("restack -s --onto main", { fromDir: tmpDir.name });
        chai_1.expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("3, 1");
        chai_1.expect(() => misc_1.execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
            .throw;
    });
});
//# sourceMappingURL=restack.test.js.map