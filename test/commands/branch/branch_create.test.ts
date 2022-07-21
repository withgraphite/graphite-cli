import { expect } from 'chai';
import { unstagedChanges } from '../../../src/lib/git/git_status_utils';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    configureTest(this, scene);

    it('Can run branch create', () => {
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      expect(scene.repo.currentBranchName()).to.equal('a');
      scene.repo.createChangeAndCommit('2', '2');

      scene.repo.runCliCommand(['branch', 'down']);
      expect(scene.repo.currentBranchName()).to.equal('main');
    });

    it('Can rollback changes on a failed commit hook', () => {
      // Aggressive AF commit hook from your angry coworker
      scene.repo.createPrecommitHook('exit 1');
      scene.repo.createChange('2');
      expect(() => {
        scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      }).to.throw(Error);
      expect(scene.repo.currentBranchName()).to.equal('main');
    });

    it('Can create a branch without providing a name', () => {
      scene.repo.createChange('2');
      scene.repo.runCliCommand([`branch`, `create`, `-m`, `feat(test): info`]);
      expect(scene.repo.currentBranchName().includes('feat_test_info')).to.be
        .true;
    });

    it('Can create a branch with add all option', () => {
      scene.repo.createChange('23', 'test', true);
      expect(unstagedChanges()).to.be.true;
      scene.repo.runCliCommand([
        `branch`,
        `create`,
        `test-branch`,
        `-m`,
        `add all`,
        `-a`,
      ]);
      expect(unstagedChanges()).to.be.false;
    });

    it('Can restack its parents children', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
      scene.repo.runCliCommand(['bd']);

      scene.repo.createChange('c', 'c');
      scene.repo.runCliCommand([
        `branch`,
        `create`,
        `c`,
        `-m`,
        `c`,
        `--insert`,
      ]);
      expect(() => scene.repo.runCliCommand(['branch', 'up'])).not.to.throw();

      expectCommits(scene.repo, 'b, c, a');
    });
  });
}
