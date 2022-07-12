import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): downstack restack`, function () {
    configureTest(this, scene);

    it('Can restack one branch', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.checkoutBranch('b');
      scene.repo.execCliCommand('branch restack -q');

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, 1.5, a, 1');
    });
  });
}
