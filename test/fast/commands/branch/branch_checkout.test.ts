import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    configureTest(this, scene);

    it("Can checkout a branch", () => {
      scene.repo.createChange("a", "a");
      scene.repo.execCliCommand(`branch create a -m "a" -q`);
      scene.repo.checkoutBranch("main");
      scene.repo.execCliCommand(`branch checkout a`);

      expect(scene.repo.currentBranchName()).to.eq("a");
    });
  });
}
