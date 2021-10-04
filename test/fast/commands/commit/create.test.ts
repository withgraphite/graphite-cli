import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest, expectCommits } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): commit create`, function () {
    configureTest(this, scene);

    it("Can create a commit", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`commit create -m "2" -q`);

      expect(scene.repo.currentBranchName()).to.equal("main");
      expectCommits(scene.repo, "2, 1");
    });

    it("Can create a commit with a multi-word commit message", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`commit create -m "a b c" -q`);

      expect(scene.repo.currentBranchName()).to.equal("main");
      expectCommits(scene.repo, "a b c");
    });

    it("Fails to create a commit if there are no staged changes", () => {
      expect(() =>
        scene.repo.execCliCommand(`commit create -m "a" -q`)
      ).to.throw(Error);
    });

    it("Automatically fixes upwards", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create a -m "2" -q`);

      scene.repo.createChange("3", "3");
      scene.repo.execCliCommand(`branch create b -m "3" -q`);

      scene.repo.checkoutBranch("a");
      scene.repo.createChange("2.5", "2.5");
      scene.repo.execCliCommand(`commit create -m "2.5" -q`);

      scene.repo.checkoutBranch("b");
      expectCommits(scene.repo, "3, 2.5, 2, 1");
    });
  });
}
