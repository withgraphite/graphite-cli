import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): commit create`, function () {
    configureTest(this, scene);

    it('Can create a commit', () => {
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('2');
      scene.repo.runCliCommand([`commit`, `create`, `-m`, `2`]);

      expect(scene.repo.currentBranchName()).to.equal('a');
      expectCommits(scene.repo, '2, 1');
    });

    it('Can create a commit with a multi-word commit message', () => {
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('2');
      scene.repo.runCliCommand([`commit`, `create`, `-m`, `a b c`]);

      expect(scene.repo.currentBranchName()).to.equal('a');
      expectCommits(scene.repo, 'a b c');
    });

    it('Fails to create a commit if there are no staged changes', () => {
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      expect(() =>
        scene.repo.runCliCommand([`commit`, `create`, `-m`, `a`])
      ).to.throw(Error);
    });

    it('Automatically restacks upwards', () => {
      scene.repo.createChange('2', '2');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);

      scene.repo.createChange('3', '3');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);

      scene.repo.checkoutBranch('a');
      scene.repo.createChange('2.5', '2.5');
      scene.repo.runCliCommand([`commit`, `create`, `-m`, `2.5`]);

      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, '3, 2.5, 2, 1');
    });
  });
}
