import { expect } from 'chai';
import { branchExists } from '../../../../src/lib/utils/branch_exists';
import { MetadataRef } from '../../../../src/wrapper-classes/metadata_ref';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectBranches } from '../../../lib/utils/expect_branches';

for (const scene of allScenes) {
  describe(`(${scene}): branch delete`, function () {
    configureTest(this, scene);

    it('Can run branch delete', () => {
      const branchName = 'a';

      scene.repo.createChangeAndCommit('2', '2');
      scene.repo.execCliCommand(
        `branch create "${branchName}" -m "${branchName}" -q`
      );
      expect(scene.repo.currentBranchName()).to.equal(branchName);

      scene.repo.checkoutBranch('main');
      scene.repo.execCliCommand(`branch delete "${branchName}" -f -q`);

      expectBranches(scene.repo, 'main');
      expect(branchExists(branchName)).to.be.false;

      expect(
        MetadataRef.allMetadataRefs().find(
          (ref) => ref._branchName === branchName
        )
      ).to.be.undefined;
    });

    it('Can run branch delete on a branch not created/tracked by Graphite', () => {
      const branchName = 'a';

      scene.repo.createAndCheckoutBranch(branchName);
      scene.repo.createChangeAndCommit('2', '2');

      scene.repo.checkoutBranch('main');
      scene.repo.execCliCommandAndGetOutput(`bdl "${branchName}" -f -q`);

      expectBranches(scene.repo, 'main');
      expect(branchExists(branchName)).to.be.false;

      expect(
        MetadataRef.allMetadataRefs().find(
          (ref) => ref._branchName === branchName
        )
      ).to.be.undefined;
    });
  });
}
