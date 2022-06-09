import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectBranches } from '../../../lib/utils/expect_branches';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): branch untrack`, function () {
    configureTest(this, scene);

    it('Can untrack a tracked branch', () => {
      // Create our branches
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      expectBranches(scene.repo, 'a, b, main');
      expectCommits(scene.repo, 'b, a, 1');

      // untracking doesn't actually delete the branch
      scene.repo.execCliCommand(`branch untrack b`);
      expectBranches(scene.repo, 'a, b, main');

      // can't navigate from an untracked branch
      expect(() => {
        scene.repo.execCliCommand('branch down');
      }).to.throw();

      // can't navigate to an untracked branch
      scene.repo.checkoutBranch('a');
      expectCommits(scene.repo, 'a, 1');
      scene.repo.execCliCommand('branch up');
      expectCommits(scene.repo, 'a, 1');
    });

    it('Can untrack a tracked branch with children', () => {
      // Create our branches
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      scene.repo.createChange('c', 'c');
      scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
      expectBranches(scene.repo, 'a, b, c, main');
      expectCommits(scene.repo, 'c, b, a, 1');

      // untracking doesn't actually delete the branches
      scene.repo.execCliCommand(`branch untrack b -f`);
      expectBranches(scene.repo, 'a, b, c, main');

      scene.repo.checkoutBranch('c');
      // can't navigate from an untracked branch
      expect(() => {
        scene.repo.execCliCommand('branch down');
      }).to.throw();
    });
  });
}
