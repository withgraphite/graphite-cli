import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): next and prev`, function () {
    configureTest(this, scene);

    it("Can move to the next and prev branch", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.createChangeAndCommit("2");
      scene.repo.createChangeAndCommit("3");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("4");
      scene.repo.createChangeAndCommit("5");
      scene.repo.checkoutBranch("a");

      expect(scene.repo.currentBranchName()).to.equal("a");
      scene.repo.execCliCommand(`branch next`);
      expect(scene.repo.currentBranchName()).to.equal("b");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.equal("a");
    });
  });
}
