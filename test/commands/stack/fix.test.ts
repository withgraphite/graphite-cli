import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest, expectCommits } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stack fix`, function () {
    configureTest(this, scene);

    it("Can fix a stack of three branches", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");
      scene.repo.createChangeAndCommit("2.5", "a.5");

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand("branch create 'b' -m '3' -s");
      scene.repo.createChangeAndCommit("3.5", "b.5");

      scene.repo.createChange("4", "c");
      scene.repo.execCliCommand("branch create 'c' -m '4' -s");

      expectCommits(scene.repo, "4, 3.5, 3, 2.5, 2, 1");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5", "main");
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(", ")
      ).to.equal("1.5, 1");

      scene.repo.execCliCommand("stack fix --rebase -s");

      expect(scene.repo.currentBranchName()).to.equal("main");

      scene.repo.checkoutBranch("c");
      expectCommits(scene.repo, "4, 3.5, 3, 2.5, 2, 1.5, 1");
    });

    it("Can handle merge conflicts, leveraging prevRef metadata", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");

      scene.repo.createChange("3");
      scene.repo.execCliCommand("branch create 'b' -m '3' -s");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5");

      scene.repo.execCliCommand("stack fix --rebase -s");
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expect(scene.repo.currentBranchName()).to.eq("a");

      scene.repo.execCliCommand("stack fix --rebase -s");
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.currentBranchName()).to.eq("b");
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(", ")
      ).to.equal("3, 2, 1.5, 1");
    });

    it("Can fix one specific stack", () => {
      scene.repo.createChange("a", "a");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -s");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5", "1.5");

      scene.repo.checkoutBranch("a");

      scene.repo.execCliCommand("stack fix --rebase -s");

      expect(scene.repo.currentBranchName()).to.eq("a");
      expectCommits(scene.repo, "a, 1.5, 1");
    });
  });
}
