import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("Next or Prev tests", function () {
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

  it("Can move to the next and prev branch", () => {
    repo.createAndCheckoutBranch("a");
    repo.createChangeAndCommit("2");
    repo.createChangeAndCommit("3");
    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("4");
    repo.createChangeAndCommit("5");
    repo.checkoutBranch("a");

    expect(repo.currentBranchName()).to.equal("a");
    execCliCommand(`next`, { fromDir: tmpDir.name });
    expect(repo.currentBranchName()).to.equal("b");
    execCliCommand(`prev`, { fromDir: tmpDir.name });
    expect(repo.currentBranchName()).to.equal("a");
  });
});
