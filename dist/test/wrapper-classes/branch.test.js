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
describe("Branch tests", function () {
    it("Can list git parent for a branch", () => {
        const tmpDir = tmp_1.default.dirSync();
        const repo = new git_repo_1.default(tmpDir.name);
        const oldDir = __dirname;
        process.chdir(tmpDir.name);
        repo.createChangeAndCommit("1");
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        const branch = new branch_1.default("a");
        chai_1.expect(branch.getParentsFromGit()[0].name).to.equal("main");
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    it("Can list parent based on meta for a branch", () => {
        const tmpDir = tmp_1.default.dirSync();
        const repo = new git_repo_1.default(tmpDir.name);
        const oldDir = __dirname;
        process.chdir(tmpDir.name);
        repo.createChangeAndCommit("1");
        repo.createChange("2");
        misc_1.execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
        const branch = new branch_1.default("a");
        chai_1.expect(branch.getParentFromMeta()).is.not.undefined;
        chai_1.expect(branch.getParentFromMeta().name).to.equal("main");
        process.chdir(oldDir);
        fs_extra_1.default.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
});
//# sourceMappingURL=branch.test.js.map