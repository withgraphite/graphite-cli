import { expect } from "chai";
import { Branch } from "../../../src/wrapper-classes";
import { allScenes } from "../../scenes";
import { configureTest, expectCommits } from "../../utils";

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): stack fix`, function () {
    configureTest(this, scene);

    it("Can fix a stack of three branches", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");
      scene.repo.createChangeAndCommit("2.5", "a.5");

      scene.repo.createChange("3", "b");
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");
      scene.repo.createChangeAndCommit("3.5", "b.5");

      scene.repo.createChange("4", "c");
      scene.repo.execCliCommand("branch create 'c' -m '4' -q");

      expectCommits(scene.repo, "4, 3.5, 3, 2.5, 2, 1");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5", "main");
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(", ")
      ).to.equal("1.5, 1");

      scene.repo.execCliCommand("stack fix --rebase -q");

      expect(scene.repo.currentBranchName()).to.equal("main");

      scene.repo.checkoutBranch("c");
      expectCommits(scene.repo, "4, 3.5, 3, 2.5, 2, 1.5, 1");
    });

    it("Can handle merge conflicts, leveraging prevRef metadata", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");

      scene.repo.createChange("3");
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5");

      scene.repo.execCliCommand("stack fix --rebase -q");
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expect(scene.repo.currentBranchName()).to.eq("a");

      scene.repo.execCliCommand("stack fix --rebase -q");
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.currentBranchName()).to.eq("b");
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(", ")
      ).to.equal("3, 2, 1.5, 1");
    });

    it("Can fix one specific stack", () => {
      scene.repo.createChange("a", "a");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange("b", "b");
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("1.5", "1.5");

      scene.repo.checkoutBranch("b");

      scene.repo.execCliCommand("stack fix --rebase -q");

      expect(scene.repo.currentBranchName()).to.eq("b");
      expectCommits(scene.repo, "b, a, 1.5, 1");
    });

    // regen tests

    it("Can regen a stack from scratch", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChangeAndCommit("3");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("4");

      const branch = new Branch("b");

      expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
        branch.stackByTracingGitParents().join(",")
      );

      scene.repo.checkoutBranch("a");

      scene.repo.execCliCommand("stack fix --regen -q");

      scene.repo.checkoutBranch("b");

      expect(branch.stackByTracingMetaParents().join(",")).to.equal(
        branch.stackByTracingGitParents().join(",")
      );
    });

    it("Can regen from trunk branch", () => {
      // Make sure to ignore prod branch
      try {
        scene.repo.execCliCommand(
          "repo init --trunk main --ignore-branches prod"
        );
      } catch {
        // fails if the scene doesnt have a prod branch, dont worry.
      }

      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("b");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("2");

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");

      scene.repo.checkoutBranch("main");
      scene.repo.execCliCommand("stack fix --regen -q");

      scene.repo.checkoutBranch("b");
      scene.repo.execCliCommand(`branch prev --no-interactive`);
      expect(scene.repo.currentBranchName()).to.eq("a");
      scene.repo.execCliCommand(`branch prev --no-interactive`);
      expect(scene.repo.currentBranchName()).to.eq("main");

      scene.repo.checkoutBranch("c");
      scene.repo.execCliCommand(`branch prev --no-interactive`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });

    it("Can gen a stack where the branch matches main HEAD", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.execCliCommand("stack fix --regen -q");
      expect(scene.repo.currentBranchName()).to.eq("a");
      scene.repo.execCliCommand(`branch prev --no-interactive`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });

    it("Can gen a stack branch head is behind main", () => {
      scene.repo.createAndCheckoutBranch("a");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("2");

      scene.repo.checkoutBranch("a");
      scene.repo.execCliCommand("stack fix --regen -q");

      scene.repo.execCliCommand(`branch prev --no-interactive`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });
  });
}
