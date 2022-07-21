import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectBranches } from '../../lib/utils/expect_branches';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): branch untrack`, function () {
    configureTest(this, scene);

    it('Can untrack a tracked branch', () => {
      // Create our branches
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
      expectBranches(scene.repo, 'a, b, main');
      expectCommits(scene.repo, 'b, a, 1');

      // untracking doesn't actually delete the branch
      scene.repo.runCliCommand([`branch`, `untrack`, `b`]);
      expectBranches(scene.repo, 'a, b, main');

      // can't navigate from an untracked branch
      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).to.throw();

      // can't navigate to an untracked branch
      scene.repo.checkoutBranch('a');
      expectCommits(scene.repo, 'a, 1');
      scene.repo.runCliCommand([`branch`, `up`]);
      expectCommits(scene.repo, 'a, 1');
    });

    it('Can untrack a tracked branch with children', () => {
      // Create our branches
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
      scene.repo.createChange('c', 'c');
      scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
      expectBranches(scene.repo, 'a, b, c, main');
      expectCommits(scene.repo, 'c, b, a, 1');

      // untracking doesn't actually delete the branches
      scene.repo.runCliCommand([`branch`, `untrack`, `b`, `-f`]);
      expectBranches(scene.repo, 'a, b, c, main');

      scene.repo.checkoutBranch('c');
      // can't navigate from an untracked branch
      expect(() => {
        scene.repo.runCliCommand([`branch`, `down`]);
      }).to.throw();
    });
  });
}
