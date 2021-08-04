import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): next and prev`, function () {
    configureTest(this, scene);

    it("Can move to the next and prev branch", () => {
      scene.repo.createChange("a", "a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
      scene.repo.checkoutBranch("main");

      scene.repo.execCliCommand(`branch next`);
      expect(scene.repo.currentBranchName()).to.equal("a");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.equal("main");
      expect(() => scene.repo.execCliCommand(`branch prev`)).to.throw(Error);
    });
  });
}
