import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    configureTest(this, scene);

    it("Can run branch create", () => {
      scene.repo.execCliCommand(`branch create "a" -q`);
      expect(scene.repo.currentBranchName()).to.equal("a");

      scene.repo.execCliCommand("branch prev --no-interactive");
      expect(scene.repo.currentBranchName()).to.equal("main");
    });

    it("Can rollback changes on a failed commit hook", () => {
      // Agressive AF commit hook from your angry coworker
      scene.repo.createPrecommitHook("exit 1");
      scene.repo.createChange("2");
      expect(() => {
        scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      }).to.throw(Error);
      expect(scene.repo.currentBranchName()).to.equal("main");
    });

    it("Can create a branch without providing a name", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`branch create -m "feat(test): info" -q`);
      expect(scene.repo.currentBranchName().includes("feat_test_info")).to.be
        .true;
    });
  });
}
