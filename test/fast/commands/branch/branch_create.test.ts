import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    configureTest(this, scene);

    it("Can run branch create", () => {
      scene.repo.execCliCommand(`branch create "a" -q`);
      expect(scene.repo.currentBranchName()).to.equal("a");
      scene.repo.createChangeAndCommit("2", "2");

      scene.repo.execCliCommand("branch prev --no-interactive");
      expect(scene.repo.currentBranchName()).to.equal("main");
    });

    it("Can rollback changes on a failed commit hook", () => {
      // Aggressive AF commit hook from your angry coworker
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

    it("Can create a branch with add all option", () => {
      scene.repo.createChange("23", "test", true);
      expect(scene.repo.unstagedChanges()).to.be.true
      scene.repo.execCliCommand(`branch create test-branch -m "add all" -a -q`);
      expect(scene.repo.unstagedChanges()).to.be.false
    });

    it("Cant create a branch off an ignored branch", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.execCliCommand("repo init --trunk main --ignore-branches a");
      expect(() => scene.repo.execCliCommand(`branch create test -q`)).to.throw(
        Error
      );
    });
  });
}
