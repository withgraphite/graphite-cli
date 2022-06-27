import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): branch track`, function () {
    configureTest(this, scene);
    it('Can track and restack the current branch if previously untracked', () => {
      // Create our dangling branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a1', 'a1');
      scene.repo.createChangeAndCommit('a2', 'a2');
      scene.repo.createChangeAndCommit('a3', 'a3');

      // Move main forward
      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('b', 'b');

      // we should be able to track the dangling branch 'a' while it's checked out
      scene.repo.checkoutBranch('a');
      expect(() => {
        scene.repo.execCliCommand('branch track -p main');
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
