import { expect } from 'chai';
import { MetadataRef } from '../../../../src/wrapper-classes';
import { Branch } from '../../../../src/wrapper-classes/branch';
import { allScenes } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';
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
      expect(Branch.exists(branchName)).to.be.false;

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
      expect(Branch.exists(branchName)).to.be.false;

      expect(
        MetadataRef.allMetadataRefs().find(
          (ref) => ref._branchName === branchName
        )
      ).to.be.undefined;
    });
  });
}
