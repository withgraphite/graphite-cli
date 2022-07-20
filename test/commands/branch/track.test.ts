import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  // eslint-disable-next-line max-lines-per-function
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
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `main`]);
      }).to.not.throw();

      expectCommits(scene.repo, 'a3, a2, a1, 1');

      scene.repo.runCliCommand([`branch`, `restack`]);

      expectCommits(scene.repo, 'a3, a2, a1, b, 1');

      // Prove that we have meta now.
      scene.repo.runCliCommand([`branch`, `down`]);
      expect(scene.repo.currentBranchName()).to.eq('main');
    });
    it('Can track a branch, and then insert a branch before and track both as a stack', () => {
      // Create our branch
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('a', 'a');
      scene.repo.createChangeAndCommit('b', 'b');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `main`]);
      }).to.not.throw();

      expectCommits(scene.repo, 'b, a, 1');

      // Prove that we have meta now.
      scene.repo.runCliCommand([`branch`, `down`]);
      expect(scene.repo.currentBranchName()).to.eq('main');

      scene.repo.runGitCommand([`branch`, `a`, `b~`]);
      scene.repo.checkoutBranch('a');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `main`]);
      }).to.not.throw();

      expectCommits(scene.repo, 'a, 1');

      // Prove that we have meta now.
      scene.repo.runCliCommand([`branch`, `down`]);
      expect(scene.repo.currentBranchName()).to.eq('main');

      scene.repo.checkoutBranch('b');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `a`]);
      }).to.not.throw();

      expectCommits(scene.repo, 'b, a, 1');

      // Prove that meta is correctly updated.
      scene.repo.runCliCommand([`branch`, `down`]);
      expect(scene.repo.currentBranchName()).to.eq('a');
    });
    it('Needs a rebase to track a branch that is created and whose parent is amended', () => {
      // Create our branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a', 'a');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('b', 'b');
      expectCommits(scene.repo, 'b, a, 1');

      scene.repo.checkoutBranch('a');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `main`]);
      }).not.to.throw();

      scene.repo.createChangeAndAmend('a1', 'a1');
      scene.repo.checkoutBranch('b');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `a`]);
      }).to.throw();

      scene.repo.runGitCommand(['rebase', 'a']);

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-p`, `a`]);
      }).to.not.throw();

      expectCommits(scene.repo, 'b, a, 1');

      // Prove that we have meta now.
      scene.repo.runCliCommand([`branch`, `down`]);
      expect(scene.repo.currentBranchName()).to.eq('a');
    });

    it('Tracks the most recent ancestor when `--force` is passed in', () => {
      // Create our branch
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a', 'a');
      expectCommits(scene.repo, 'a, 1');

      scene.repo.checkoutBranch('a');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-f`]);
      }).not.to.throw();

      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('main');

      scene.repo.runCliCommand([`branch`, `up`]);
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('b', 'b');
      expectCommits(scene.repo, 'b, a, 1');

      expect(() => {
        scene.repo.runCliCommand([`branch`, `track`, `-f`]);
      }).not.to.throw();

      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).not.to.throw();
      expect(scene.repo.currentBranchName()).to.eq('a');
    });
  });
}
