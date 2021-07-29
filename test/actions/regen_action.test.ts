import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { regenAction } from "../../src/actions/regen";
import Branch from "../../src/wrapper-classes/branch";
import GitRepo from "../utils/git_repo";

describe("regen action", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  const oldDir = __dirname;

  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    process.chdir(tmpDir.name);
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });

  this.afterEach(() => {
    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  this.timeout(5000);

  it("Updates the parent branch of the base of the stack", async () => {
    const trunkBranchName = repo.currentBranchName();
    const baseBranchName = "base-stack-branch";
    repo.createAndCheckoutBranch(baseBranchName);
    repo.createChangeAndCommit("update");

    await regenAction(true);

    const baseBranch = await Branch.branchWithName(baseBranchName);
    expect(baseBranch.getParentFromMeta()?.name).to.be.equal(trunkBranchName);
  });

  it("Works from the middle of a stack", async () => {
    const trunkBranchName = repo.currentBranchName();

    // Stack: trunk -> a -> b -> c
    const branchA = "a";
    const branchB = "b";
    const branchC = "c";
    repo.createAndCheckoutBranch(`${branchA}`);
    repo.createChangeAndCommit(`${branchA}`);
    repo.createAndCheckoutBranch(`${branchB}`);
    repo.createChangeAndCommit(`${branchB}`);
    repo.createAndCheckoutBranch(`${branchC}`);
    repo.createChangeAndCommit(`${branchC}`);

    repo.checkoutBranch(branchA);
    await regenAction(true);

    const a = await Branch.branchWithName(branchA);
    expect(a.getParentFromMeta()?.name).to.be.equal(trunkBranchName);

    const b = await Branch.branchWithName(branchB);
    expect(b.getParentFromMeta()?.name).to.be.equal(branchA);

    const c = await Branch.branchWithName(branchC);
    expect(c.getParentFromMeta()?.name).to.be.equal(branchB);
  });
});
