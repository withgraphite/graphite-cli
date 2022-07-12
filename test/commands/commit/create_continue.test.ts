import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): commit create continue`, function () {
    configureTest(this, scene);

    it('Can continue a commit create with single merge conflict', () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChange('1');

      expect(() =>
        scene.repo.execCliCommand("commit create -m 'c' -q")
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();

      // ensure that continue state is not affected by running another command
      scene.repo.execCliCommand('log');

      scene.repo.execCliCommand('continue');

      // Continue should finish the work that stack fix started, not only
      // completing the rebase but also re-checking out the original
      // branch.
      expect(scene.repo.currentBranchName()).to.equal('a');
      expectCommits(scene.repo, 'c, a, 1');
      expect(scene.repo.rebaseInProgress()).to.be.false;

      // Expect that the stack was also put back together.
      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, 'b, c, a');
    });

    it('Can run continue multiple times on a commit create with multiple merge conflicts', () => {
      scene.repo.createChange('a', '1');
      scene.repo.createChange('a', '2');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b', '1');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.createChange('c', '2');
      scene.repo.execCliCommand("branch create 'c' -m 'c' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChange('1', '1');
      scene.repo.createChange('2', '2');

      expect(() =>
        scene.repo.execCliCommand("commit create -m 'a12' -q")
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();

      expect(() => scene.repo.execCliCommand('continue')).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand('continue');

      // Note that even though multiple continues have been run, the original
      // context - that the original commit amend was kicked off at 'a' -
      // should not be lost.
      expect(scene.repo.currentBranchName()).to.equal('a');
      expectCommits(scene.repo, 'a12, a, 1');
      expect(scene.repo.rebaseInProgress()).to.be.false;

      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, 'c, b, a12, a');
    });
  });
}
