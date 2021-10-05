import { expect } from "chai";
import { Branch, MetadataRef } from "../../../../src/wrapper-classes";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";
import { expectBranches } from "../../../lib/utils/expect_branches";

for (const scene of allScenes) {
  describe(`(${scene}): branch delete`, function () {
    configureTest(this, scene);

    it("Can run branch delete", () => {
      const branchName = "a";

      scene.repo.createChangeAndCommit("2", "2");
      scene.repo.execCliCommand(`branch create "${branchName}" -q`);
      expect(scene.repo.currentBranchName()).to.equal(branchName);

      scene.repo.checkoutBranch("main");
      scene.repo.execCliCommand(`branch delete "${branchName}" -D -q`);

      expectBranches(scene.repo, "main");
      expect(Branch.exists(branchName)).to.be.false;

      expect(
        MetadataRef.allMetadataRefs().find(
          (ref) => ref._branchName === branchName
        )
      ).to.be.undefined;
    });
  });
}
