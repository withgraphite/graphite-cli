import { expect } from "chai";
import Branch from "../../../src/wrapper-classes/branch";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stack regen`, function () {
    configureTest(this, scene);

    it("Can fix a stack", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create "a" -s`);

      scene.repo.createChangeAndCommit("3");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("4");

      const branch = new Branch("b");

      expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
        branch.stackByTracingGitParents().join(",")
      );

      scene.repo.checkoutBranch("main");

      scene.repo.execCliCommand("stack regen -s");

      scene.repo.checkoutBranch("b");

      expect(branch.stackByTracingMetaParents().join(",")).to.equal(
        branch.stackByTracingGitParents().join(",")
      );
    });
  });
}
