import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): upstack onto`, function () {
    configureTest(this, scene);

    it("Can fix a leaf stack onto main", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand("branch create 'b' -m '3' -s");

      scene.repo.execCliCommand("upstack onto main -s");
      scene.repo.expectCommits("3, 1");
      expect(() => scene.repo.execCliCommand("validate -s")).not.to.throw;
    });

    it("Can gracefully catch a merge conflict on first rebase", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("3", "a");

      scene.repo.checkoutBranch("a");
      expect(() => {
        scene.repo.execCliCommand("upstack onto main -s");
      }).to.not.throw();
    });

    it("Can recover a branch that has no git and meta parents", () => {
      // Create our dangling branch
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.createChangeAndCommit("a", "a");

      // Move main forward
      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("b", "b");

      // branch a is dangling now, but we should still be able to "upstack onto" main
      scene.repo.checkoutBranch("a");
      expect(() => {
        scene.repo.execCliCommand("upstack onto main");
      }).to.not.throw();
      scene.repo.expectCommits("a, b, 1");
    });
  });
}
