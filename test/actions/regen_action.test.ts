import { expect } from "chai";
import { regenAction } from "../../src/actions/regen";
import Branch from "../../src/wrapper-classes/branch";
import { allScenes } from "../scenes";
import { configureTest } from "../utils";

for (const scene of allScenes) {
  describe(`(${scene}): regen action`, function () {
    configureTest(this, scene);

    it("Updates the parent branch of the base of the stack", async () => {
      const trunkBranchName = scene.repo.currentBranchName();
      const baseBranchName = "base-stack-branch";
      scene.repo.createAndCheckoutBranch(baseBranchName);
      scene.repo.createChangeAndCommit("update");

      await regenAction(true);

      const baseBranch = await Branch.branchWithName(baseBranchName);
      expect(baseBranch.getParentFromMeta()?.name).to.be.equal(trunkBranchName);
    });

    it("Works from the middle of a stack", async () => {
      const trunkBranchName = scene.repo.currentBranchName();

      // Stack: trunk -> a -> b -> c
      const branchA = "a";
      const branchB = "b";
      const branchC = "c";
      scene.repo.createAndCheckoutBranch(`${branchA}`);
      scene.repo.createChangeAndCommit(`${branchA}`);
      scene.repo.createAndCheckoutBranch(`${branchB}`);
      scene.repo.createChangeAndCommit(`${branchB}`);
      scene.repo.createAndCheckoutBranch(`${branchC}`);
      scene.repo.createChangeAndCommit(`${branchC}`);

      scene.repo.checkoutBranch(branchA);
      await regenAction(true);

      const a = await Branch.branchWithName(branchA);
      expect(a.getParentFromMeta()?.name).to.be.equal(trunkBranchName);

      const b = await Branch.branchWithName(branchB);
      expect(b.getParentFromMeta()?.name).to.be.equal(branchA);

      const c = await Branch.branchWithName(branchC);
      expect(c.getParentFromMeta()?.name).to.be.equal(branchB);
    });
  });
}
