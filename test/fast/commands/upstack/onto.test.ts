import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): upstack onto`, function () {
    configureTest(this, scene);

    it('Can fix a leaf stack onto main', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");

      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      scene.repo.execCliCommand('upstack onto main -q');
      expectCommits(scene.repo, '3, 1');
      expect(() => scene.repo.execCliCommand('validate -q')).not.to.throw;
    });

    it('Can gracefully catch a merge conflict on first rebase', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('3', 'a');

      scene.repo.checkoutBranch('a');
      expect(() => {
        scene.repo.execCliCommand('upstack onto main -q');
      }).to.not.throw();
    });

    it('Can recover a branch that has no git and meta parents', () => {
      // Create our dangling branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a1', 'a1');
      scene.repo.createChangeAndCommit('a2', 'a2');
      scene.repo.createChangeAndCommit('a3', 'a3');

      // Move main forward
      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('b', 'b');

      // branch a is dangling now, but we should still be able to "upstack onto" main
      scene.repo.checkoutBranch('a');
      expect(() => {
        scene.repo.execCliCommand('upstack onto main');
      }).to.not.throw();
      expectCommits(scene.repo, 'a3, a2, a1, b, 1');
      scene.repo.checkoutBranch('a');

      // Prove that we have meta now.
      scene.repo.execCliCommand('branch prev --no-interactive');
      expect(scene.repo.currentBranchName()).to.eq('main');
    });
  });
}
