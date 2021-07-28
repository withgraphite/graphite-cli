import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { execCliCommand } from "../../utils/exec_cli_command";
import GitRepo from "../../utils/git_repo";

describe("upstack onto", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1", "first");
  });
  afterEach(() => {
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can fix a leaf stack onto main", () => {
    repo.createChange("2", "a");
    execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3", "b");
    execCliCommand("branch create 'b' -m '3' -s", { fromDir: tmpDir.name });

    execCliCommand("upstack onto main -s", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("3, 1");
    expect(() => execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
      .throw;
  });

  it("Can gracefully catch a merge conflict on first rebase", () => {
    repo.createChange("2", "a");
    execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.checkoutBranch("main");
    repo.createChangeAndCommit("3", "a");

    repo.checkoutBranch("a");
    expect(() => {
      execCliCommand("upstack onto main -s", { fromDir: tmpDir.name });
    }).to.not.throw();
  });

  it("Can recover a branch that has no git and meta parents", () => {
    // Create our dangling branch
    repo.createAndCheckoutBranch("a");
    repo.createChangeAndCommit("a", "a");

    // Move main forward
    repo.checkoutBranch("main");
    repo.createChangeAndCommit("b", "b");

    // branch a is dangling now, but we should still be able to "upstack onto" main
    repo.checkoutBranch("a");
    expect(() => {
      execCliCommand("upstack onto main", { fromDir: tmpDir.name });
    }).to.not.throw();
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "a, b, 1"
    );
  });
});
