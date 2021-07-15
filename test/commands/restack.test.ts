import { expect } from "chai";
import tmp from "tmp";
import GitRepo from "../utils/git_repo";
import { execCliCommand } from "../utils/misc";

describe("Restack", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  afterEach(() => {
    // fs.emptyDirSync(tmpDir.name);
    // tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can restack a stack of three branches", () => {
    repo.createChange("2");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });
    repo.createChangeAndCommit("2.5");

    repo.createChange("3");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });
    repo.createChangeAndCommit("3.5");

    repo.createChange("4");
    execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3.5, 3, 2.5, 2, 1"
    );

    repo.checkoutBranch("main");
    repo.createChangeAndCommit("1.5");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "1.5, 1"
    );

    console.log(tmpDir.name)
    execCliCommand("restack", { fromDir: tmpDir.name });
    // Expect restacking not to change the current checked out branch.
    expect(repo.currentBranchName()).to.equal("main");

    repo.checkoutBranch("c");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3.5, 3, 2.5, 2, 1.5, 1"
    );
  });

  it("Cannot restack branches that fail validation", () => {
    repo.createAndCheckoutBranch("a");
    repo.createChangeAndCommit("2");
    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("3");
    expect(() => {
      execCliCommand("restack -s", { fromDir: tmpDir.name });
    }).to.throw();
  });

  it("Can restack a stack onto another", () => {
    repo.createChange("2");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });

    repo.checkoutBranch("main");

    repo.createChange("4");
    execCliCommand("diff -b 'c' -m '4' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("4, 1");
    execCliCommand("restack -s --onto b", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      "4, 3, 2, 1"
    );
    expect(() => execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
      .throw;
  });
});
