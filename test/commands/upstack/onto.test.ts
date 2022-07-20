import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): upstack onto`, function () {
    configureTest(this, scene);

    it('Can fix a leaf stack onto main', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);

      scene.repo.createChange('3', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);

      scene.repo.runCliCommand([`upstack`, `onto`, `main`]);
      expectCommits(scene.repo, '3, 1');
    });

    it('Can catch a merge conflict on first rebase', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('3', 'a');

      scene.repo.checkoutBranch('a');
      expect(() => {
        scene.repo.runCliCommand([`upstack`, `onto`, `main`]);
      }).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;
    });
  });
}
