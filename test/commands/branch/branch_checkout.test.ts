import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    configureTest(this, scene);

    it('Can checkout a branch', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.checkoutBranch('main');
      scene.repo.runCliCommand([`branch`, `checkout`, `a`]);

      expect(scene.repo.currentBranchName()).to.eq('a');
    });
  });
}
