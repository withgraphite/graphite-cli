import { expect } from 'chai';
import { pushBranchesToRemote } from '../../../src/actions/submit/push_branches';
import { pushMetadata } from '../../../src/actions/submit/push_metadata';
import { Branch } from '../../../src/wrapper-classes/branch';
import { CloneScene } from '../../lib/scenes/clone_scene';
import { configureTest } from '../../lib/utils';

for (const scene of [new CloneScene()]) {
  describe('handle remote actions properly (sync/submit)', function () {
    configureTest(this, scene);

    it('can push a branch and its metadata to remote', async () => {
      scene.repo.createChange('1');
      scene.repo.execCliCommand(`branch create 1 -am "1"`);
      expect(scene.repo.currentBranchName()).to.equal('1');

      await pushMetadata(
        pushBranchesToRemote([new Branch('1')], scene.context),
        scene.context
      );
      expect(scene.repo.getRef('refs/heads/1')).to.equal(
        scene.originRepo.getRef('refs/heads/1')
      );
      expect(scene.repo.getRef('refs/branch-metadata/1')).to.equal(
        scene.originRepo.getRef('refs/branch-metadata/1')
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
        pushBranchesToRemote([new Branch('1')], scene.context)
      ).to.throw();
    });
  });
}
