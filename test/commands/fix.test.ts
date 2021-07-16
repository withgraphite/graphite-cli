import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import Branch from "../../src/wrapper-classes/branch";
import GitRepo from "../utils/git_repo";
import { execCliCommand } from "../utils/misc";

describe("Fix tests", function () {
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
    execCliCommand(`diff -b "a" -s`, { fromDir: tmpDir.name });

    repo.createChangeAndCommit("3");
    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("4");

    const branch = new Branch("b");

    expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
      branch.stackByTracingGitParents().join(",")
    );

    execCliCommand("fix -s", { fromDir: tmpDir.name });

    expect(branch.stackByTracingMetaParents().join(",")).to.equal(
      branch.stackByTracingGitParents().join(",")
    );
  });
});
