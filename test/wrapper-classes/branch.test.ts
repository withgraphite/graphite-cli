import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import Branch from "../../src/wrapper-classes/branch";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("Branch tests", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  const oldDir = __dirname;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    process.chdir(tmpDir.name);
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1", "first");
  });
  afterEach(() => {
    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  it("Can list git parent for a branch", () => {
    repo.createChange("2");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    const branch = new Branch("a");
    expect(branch.getParentsFromGit()[0].name).to.equal("main");

    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  it("Can list parent based on meta for a branch", () => {
    repo.createChange("2");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    const branch = new Branch("a");
    expect(branch.getParentFromMeta()).is.not.undefined;
    expect(branch.getParentFromMeta()!.name).to.equal("main");

    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  it("Can fetch branches that point to the same commit", () => {
    repo.createAndCheckoutBranch("a");
    repo.createChangeAndCommit("2");
    repo.createAndCheckoutBranch("b");
    repo.createAndCheckoutBranch("c");
    expect(
      new Branch("a")
        .branchesWithSameCommit()
        .map((b) => b.name)
        .sort()
        .join(", ")
    ).to.eq("b, c");
  });
});
