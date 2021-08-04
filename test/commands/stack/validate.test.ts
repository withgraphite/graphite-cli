import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stack validate`, function () {
    configureTest(this, scene);

    it("Can pass validation", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
      scene.repo.createChange("3");
      scene.repo.execCliCommand(`branch create "b" -m "b" -s`);

      // Expect this command not to fail.
      scene.repo.execCliCommand("stack validate -s");
    });

    it("Can fail validation", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.createChangeAndCommit("2");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("3");

      // Expect this command to fail for having no meta.
      expect(() => {
        scene.repo.execCliCommand("stack validate -s");
      }).to.throw(Error);
    });

    it("Can pass validation if child branch points to same commit as parent", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.execCliCommand("upstack onto main");

      expect(() => {
        scene.repo.execCliCommand("stack validate -s");
      }).to.not.throw(Error);

      scene.repo.checkoutBranch("main");

      expect(() => {
        scene.repo.execCliCommand("stack validate -s");
      }).to.not.throw(Error);
    });
  });
}
