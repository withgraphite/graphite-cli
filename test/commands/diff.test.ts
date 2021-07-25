import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("Diff tests", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  afterEach(() => {
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can create a diff", () => {
    repo.createChange("2");

    execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
    expect(repo.currentBranchName()).to.equal("a");

    execCliCommand("prev", { fromDir: tmpDir.name });
    expect(repo.currentBranchName()).to.equal("main");
  });

  it("Can rollback changes on a failed commit hook", () => {
    // Agressive AF commit hook from your angry coworker
    repo.createPrecommitHook("exit 1");
    repo.createChange("2");
    expect(() => {
      execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });
    }).to.throw;
    expect(repo.currentBranchName()).to.equal("main");
  });
});
