import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): restack continue`, function () {
    configureTest(this, scene);

    it('Can continue a stack restack with single merge conflict', () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndAmend('1');

      scene.repo.execCliCommand('stack restack -q');
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand('continue');

      // Continue should finish the work that stack restack started, not only
      // completing the rebase but also re-checking out the original
      // branch.
      expect(scene.repo.currentBranchName()).to.equal('a');
      expectCommits(scene.repo, 'a, 1');
      expect(scene.repo.rebaseInProgress()).to.be.false;

      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, 'b, a, 1');
    });

    it('Can run continue multiple times on a stack restack with multiple merge conflicts', () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.createChange('c');
      scene.repo.execCliCommand("branch create 'c' -m 'c' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndAmend('a1');

      scene.repo.checkoutBranch('b');
      scene.repo.createChangeAndAmend('b1');

      scene.repo.checkoutBranch('a');

      scene.repo.execCliCommand('stack restack -q');
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand('continue');

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand('continue');

      // Note that even though multiple continues have been run, the original
      // context - that the original stack restack was kicked off at 'a' - should
      // not be lost.
      expect(scene.repo.currentBranchName()).to.equal('a');
      expect(scene.repo.rebaseInProgress()).to.be.false;

      expectCommits(scene.repo, 'a, 1');

      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, 'b, a, 1');

      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, 'c, b, a, 1');
    });
  });
}
