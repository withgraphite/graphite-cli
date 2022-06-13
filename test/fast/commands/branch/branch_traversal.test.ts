import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { BasicScene } from '../../../lib/scenes/basic_scene';
import { TrailingProdScene } from '../../../lib/scenes/trailing_prod_scene';
import { configureTest } from '../../../lib/utils/configure_test';

function setupStack(scene: BasicScene | TrailingProdScene) {
  scene.repo.createChange('a', 'a');
  scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
  scene.repo.createChange('b', 'b');
  scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
  scene.repo.createChange('c', 'b');
  scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
}

for (const scene of allScenes) {
  describe(`(${scene}): next and prev`, function () {
    configureTest(this, scene);

    it('Can move to next branch', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.checkoutBranch('main');

      scene.repo.execCliCommand(`branch up --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });

    it('Can move to prev branch', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.execCliCommand(`branch down --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });

    it('Branch down goes up to trunk', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.checkoutBranch('a');

      scene.repo.execCliCommand(`branch down --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('main');
    });

    it('Can move to next branch with numSteps = 2', () => {
      setupStack(scene);
      scene.repo.checkoutBranch('a');

      scene.repo.execCliCommand(`branch up 2 --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('c');
    });

    it('Can move to prev branch with numSteps = 2', () => {
      setupStack(scene);

      scene.repo.execCliCommand(`branch down 2 --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });

    it('Can move to top of the stack', () => {
      setupStack(scene);
      scene.repo.checkoutBranch('a');

      scene.repo.execCliCommand(`branch top --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('c');
    });

    it('Can move to bottom of the stack', () => {
      setupStack(scene);

      scene.repo.execCliCommand(`branch bottom --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });

    it('branch down moves to prev', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.execCliCommand(`branch down --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });

    it('branch up moves to next', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.checkoutBranch('main');

      scene.repo.execCliCommand(`branch up --no-interactive`);
      expect(scene.repo.currentBranchName()).to.equal('a');
    });
  });
}
