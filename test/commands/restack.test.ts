import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("Restack", function () {
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

  it("Can restack a stack of three branches", () => {
    repo.createChange("2", "a");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });
    repo.createChangeAndCommit("2.5", "a.5");

    repo.createChange("3", "b");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });
    repo.createChangeAndCommit("3.5", "b.5");

    repo.createChange("4", "c");
    execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3.5, 3, 2.5, 2, 1"
    );

    repo.checkoutBranch("main");
    repo.createChangeAndCommit("1.5", "main");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "1.5, 1"
    );

    execCliCommand("restack -s", { fromDir: tmpDir.name });

    expect(repo.currentBranchName()).to.equal("main");

    repo.checkoutBranch("c");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3.5, 3, 2.5, 2, 1.5, 1"
    );
  });

  it("Can restack a stack onto another", () => {
    repo.createChange("2", "a");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3", "b");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });

    repo.checkoutBranch("main");

    repo.createChange("4", "c");
    execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 1");
    execCliCommand("restack -s --onto b", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3, 2, 1"
    );
    expect(() => execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
      .throw;
  });

  it("Can restack a leaf stack onto main", () => {
    repo.createChange("2", "a");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3", "b");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });

    execCliCommand("restack -s --onto main", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("3, 1");
    expect(() => execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
      .throw;
  });

  it("Can handle merge conflicts, leveraging prevRef metadata", () => {
    repo.createChange("2");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });

    repo.checkoutBranch("main");
    repo.createChangeAndCommit("1.5");

    try {
      execCliCommand("restack -s", { fromDir: repo.dir });
    } catch {
      repo.finishInteractiveRebase();
    }
    expect(repo.rebaseInProgress()).to.eq(false);
    expect(repo.currentBranchName()).to.eq("a");
    try {
      execCliCommand("restack -s", { fromDir: repo.dir });
    } catch {
      repo.finishInteractiveRebase();
    }

    expect(repo.currentBranchName()).to.eq("b");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "3, 2, 1.5, 1"
    );
  });
});
