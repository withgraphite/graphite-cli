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
describe("Validate tests", function () {
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
    it("Can pass validation", () => {
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        repo.createChange("3");
        misc_1.execCliCommand(`diff -b "b" -s`, { fromDir: tmpDir.name });
        // Expect this command not to fail.
        misc_1.execCliCommand("validate -s", { fromDir: tmpDir.name });
    });
    it("Can fail validation", () => {
        const tmpDir = tmp_1.default.dirSync();
        const repo = new git_repo_1.default(tmpDir.name);
        repo.createChangeAndCommit("1");
        repo.createAndCheckoutBranch("a");
        repo.createChangeAndCommit("2");
        repo.createAndCheckoutBranch("b");
        repo.createChangeAndCommit("3");
        // Expect this command to fail for having no meta.
        chai_1.expect(() => {
            misc_1.execCliCommand("validate -s", { fromDir: tmpDir.name });
        }).to.throw;
    });
});
//# sourceMappingURL=validate.test.js.map