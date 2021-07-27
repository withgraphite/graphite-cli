import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import Branch from "../../src/wrapper-classes/branch";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("stack regen", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  const oldDir = __dirname;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    process.chdir(tmpDir.name);
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  afterEach(() => {
    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can fix a stack", () => {
    repo.createChange("2");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    repo.createChangeAndCommit("3");
    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("4");

    const branch = new Branch("b");

    expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
      branch.stackByTracingGitParents().join(",")
    );

    repo.checkoutBranch("main");

    execCliCommand("stack regen -s", { fromDir: tmpDir.name });

    repo.checkoutBranch("b");

    expect(branch.stackByTracingMetaParents().join(",")).to.equal(
      branch.stackByTracingGitParents().join(",")
    );
  });
});
