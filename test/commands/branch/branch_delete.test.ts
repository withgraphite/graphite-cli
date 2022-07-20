import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectBranches } from '../../lib/utils/expect_branches';

for (const scene of allScenes) {
  describe(`(${scene}): branch delete`, function () {
    configureTest(this, scene);

    it('Can run branch delete', () => {
      const branchName = 'a';

      scene.repo.createChangeAndCommit('2', '2');
      scene.repo.runCliCommand([
        `branch`,
        `create`,
        branchName,
        `-m`,
        branchName,
      ]);
      expect(scene.repo.currentBranchName()).to.equal(branchName);

      scene.repo.checkoutBranch('main');
      scene.repo.runCliCommand([`branch`, `delete`, branchName, `-f`]);
      expectBranches(scene.repo, 'main');
    });
  });
}
