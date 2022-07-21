import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): downstack restack`, function () {
    configureTest(this, scene);

    it('Can restack a stack of three branches', () => {
      scene.repo.createChange('2', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
      scene.repo.createChangeAndCommit('2.5', 'a.5');

      scene.repo.createChange('3', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
      scene.repo.createChangeAndCommit('3.5', 'b.5');

      scene.repo.createChange('4', 'c');
      scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `4`]);

      expectCommits(scene.repo, '4, 3.5, 3, 2.5, 2, 1');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5', 'main');
      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(', ')
      ).to.equal('1.5, 1');

      scene.repo.checkoutBranch('c');
      scene.repo.runCliCommand(['downstack', 'restack']);

      expect(scene.repo.currentBranchName()).to.equal('c');

      scene.repo.checkoutBranch('c');
      expectCommits(scene.repo, '4, 3.5, 3, 2.5, 2, 1.5, 1');
    });

    it('Can handle merge conflicts', () => {
      scene.repo.createChange('2');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);

      scene.repo.createChange('3');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5');

      scene.repo.checkoutBranch('b');

      expect(() =>
        scene.repo.runCliCommand(['downstack', 'restack'])
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.resolveMergeConflicts();

      expect(() => scene.repo.runCliCommand(['continue', '-q'])).to.throw();
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.markMergeConflictsAsResolved();
      scene.repo.runCliCommand(['continue', '-q']);

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expect(scene.repo.currentBranchName()).to.eq('b');

      expect(
        scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(', ')
      ).to.equal('3, 2, 1.5, 1');
    });

    it('Can restack one specific stack', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.checkoutBranch('b');
      scene.repo.runCliCommand(['downstack', 'restack']);

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, 1.5, a, 1');
    });

    it("Doesn't restack above current commit", () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      scene.repo.checkoutBranch('a');
      scene.repo.createChangeAndCommit('2.5', '2.5');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('1.5', '1.5');

      scene.repo.checkoutBranch('a');

      scene.repo.runCliCommand(['downstack', 'restack']);

      scene.repo.checkoutBranch('b');

      expect(scene.repo.currentBranchName()).to.eq('b');
      expectCommits(scene.repo, 'b, a, 1');
    });
  });
}
