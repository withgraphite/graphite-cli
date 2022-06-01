import { expect } from 'chai';
import { syncAction } from '../../../src/actions/sync/sync';
import { pushBranch } from '../../../src/lib/git/push_branch';
import { CloneScene } from '../../lib/scenes/clone_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new CloneScene()]) {
  // eslint-disable-next-line max-lines-per-function
  describe('handle remote actions properly (sync/submit)', function () {
    configureTest(this, scene);

    it('can push a branch to remote', async () => {
      scene.repo.createChange('1');
      scene.repo.execCliCommand(`branch create 1 -am "1"`);
      expect(scene.repo.currentBranchName()).to.equal('1');

      pushBranch({ remote: 'origin', branchName: '1', noVerify: false });

      expect(scene.repo.getRef('refs/heads/1')).to.equal(
        scene.originRepo.getRef('refs/heads/1')
      );
    });

    it('fails to push to a branch with external commits', () => {
      scene.repo.createChange('1');
      scene.repo.execCliCommand(`branch create 1 -am "1"`);
      expect(scene.repo.currentBranchName()).to.equal('1');

      scene.originRepo.createChange('2');
      scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
      expect(scene.originRepo.getRef('refs/heads/1')).to.not.equal(
        scene.repo.getRef('refs/heads/1')
      );

      expect(() =>
        pushBranch({ remote: 'origin', branchName: '1', noVerify: false })
      ).to.throw();
    });

    it('can pull trunk from remote', async () => {
      scene.originRepo.createChangeAndCommit('a');

      await syncAction(
        { pull: true, force: false, delete: false, showDeleteProgress: false },
        scene.context
      );

      expect(scene.repo.getRef('refs/heads/main')).to.equal(
        scene.originRepo.getRef('refs/heads/main')
      );
    });

    // TODO test downstack sync actions
  });
}
