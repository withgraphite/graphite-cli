import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): upstack onto`, function () {
    configureTest(this, scene);

    it('Can track and restack a dangling untracked branch', () => {
      // Create our dangling branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a1', 'a1');
      scene.repo.createChangeAndCommit('a2', 'a2');
      scene.repo.createChangeAndCommit('a3', 'a3');

      // Move main forward
      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('b', 'b');

      // branch a is dangling now, but we should still be able to track it with main as parent
      expect(() => {
        scene.repo.execCliCommand('branch track a');
      }).to.not.throw();

      expectCommits(scene.repo, 'a3, a2, a1, 1');

      scene.repo.execCliCommand('branch restack');

      expectCommits(scene.repo, 'a3, a2, a1, b, 1');

      // Prove that we have meta now.
      scene.repo.execCliCommand('branch down');
      expect(scene.repo.currentBranchName()).to.eq('main');
    });
  });
}
