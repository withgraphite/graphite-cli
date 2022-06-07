import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): upstack fix`, function () {
    configureTest(this, scene);

    it('Can fix a stack of three branches', () => {
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

      scene.repo.execCliCommand('upstack fix -q');

      expect(scene.repo.currentBranchName()).to.equal('main');

      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, '4, 3.5, 3, 2.5, 2, 1.5, 1');
    });

    it('Can handle merge conflicts, leveraging prevRef metadata', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");

      scene.repo.createChange('3');
      scene.repo.execCliCommand("branch create 'b' -m '3' -q");

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5');

      scene.repo.execCliCommand('upstack fix -q');
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expect(scene.repo.currentBranchName()).to.eq('a');

      scene.repo.execCliCommand('upstack fix -q');
      scene.repo.finishInteractiveRebase();

      expect(scene.repo.currentBranchName()).to.eq('b');
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(', ')
      ).to.equal('3, 2, 1.5, 1');
    });

    it('Can fix one specific stack', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.execCliCommand('upstack fix -q');

      scene.repo.checkoutBranch('b');

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, 1.5, a, 1');
    });

    it("Doesn't fix below current commit", () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndCommit('2.5', '2.5');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.checkoutBranch('a');

      scene.repo.execCliCommand('upstack fix -q');

      scene.repo.checkoutBranch('b');

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, 2.5, a, 1');
    });
  });
}