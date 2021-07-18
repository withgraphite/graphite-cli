"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const branch_1 = __importDefault(require("../../src/wrapper-classes/branch"));
const git_repo_1 = __importDefault(require("../utils/git_repo"));
const misc_1 = require("../utils/misc");
describe("Regen tests", function () {
    let tmpDir;
    let repo;
    const oldDir = __dirname;
    this.beforeEach(() => {
        tmpDir = tmp_1.default.dirSync();
        process.chdir(tmpDir.name);
        repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1");
    });
    afterEach(() => {
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    this.timeout(5000);
    it("Can regen a stack", () => {
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        repo.createChangeAndCommit("3");
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("4");
        const branch = new branch_1.default("b");
        chai_1.expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(branch.stackByTracingGitParents().join(","));
        misc_1.execCliCommand("regen -s", { fromDir: tmpDir.name });
        chai_1.expect(branch.stackByTracingMetaParents().join(",")).to.equal(branch.stackByTracingGitParents().join(","));
    });
});
//# sourceMappingURL=regen.test.js.map