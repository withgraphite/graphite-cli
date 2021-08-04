import { expect } from "chai";
import Branch from "../../../src/wrapper-classes/branch";
import { TrailingProdScene } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): stack regen`, function () {
    configureTest(this, scene);

    it("Can regen a stack from scratch", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);

      scene.repo.createChangeAndCommit("3");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("4");

      const branch = new Branch("b");

      expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
        branch.stackByTracingGitParents().join(",")
      );

      scene.repo.checkoutBranch("a");

      scene.repo.execCliCommand("stack regen -s");

      scene.repo.checkoutBranch("b");

      expect(branch.stackByTracingMetaParents().join(",")).to.equal(
        branch.stackByTracingGitParents().join(",")
      );
    });

    it("Can regen from trunk branch", () => {
      // Make sure to ignore prod branch
      scene.repo.execCliCommand(
        "repo init --trunk main --ignore-branches prod"
      );

      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("b");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("2");

      scene.repo.createAndCheckoutBranch("c");
      scene.repo.createChangeAndCommit("c");

      scene.repo.checkoutBranch("main");
      scene.repo.execCliCommand("stack regen");

      scene.repo.checkoutBranch("b");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("a");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");

      scene.repo.checkoutBranch("c");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });

    it("Can gen a stack where the branch matches main HEAD", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.execCliCommand("stack regen -s");
      expect(scene.repo.currentBranchName()).to.eq("a");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });

    it("Can gen a stack branch head is behind main", () => {
      scene.repo.createAndCheckoutBranch("a");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("2");

      scene.repo.checkoutBranch("a");
      scene.repo.execCliCommand("stack regen -s");

      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });
  });
}
