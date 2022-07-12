import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): stack restack`, function () {
    configureTest(this, scene);

    it('Can restack a stack of three branches', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");
      scene.repo.createChangeAndCommit('2.5', 'a.5');

      scene.repo.createChange('3', 'b');
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");
      scene.repo.createChangeAndCommit('3.5', 'b.5');

      scene.repo.createChange('4', 'c');
      scene.repo.execCliCommand("branch create 'c' -m '4' -q");

      expectCommits(scene.repo, '4, 3.5, 3, 2.5, 2, 1');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5', 'main');
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(', ')
      ).to.equal('1.5, 1');

      scene.repo.execCliCommand('stack restack -q');

      expect(scene.repo.currentBranchName()).to.equal('main');

      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, '4, 3.5, 3, 2.5, 2, 1.5, 1');
    });

    it('Can handle merge conflicts', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");

      scene.repo.createChange('3');
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5');

      expect(() => scene.repo.execCliCommand('stack restack -q')).to.throw();
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.resolveMergeConflicts();

      expect(() => scene.repo.execCliCommand('continue -q')).to.throw();
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand('continue -q');

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expect(scene.repo.currentBranchName()).to.eq('main');

      scene.repo.checkoutBranch('b');
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(', ')
      ).to.equal('3, 2, 1.5, 1');
    });

    it('Can restack one specific stack', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.checkoutBranch('b');

      scene.repo.execCliCommand('stack restack -q');

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, a, 1.5, 1');
    });
  });
}
