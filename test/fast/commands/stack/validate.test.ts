import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of allScenes) {
  describe(`(${scene}): stack validate`, function () {
    configureTest(this, scene);

    it('Can pass validation', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('3');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      // Expect this command not to fail.
      scene.repo.execCliCommand('stack validate -q');
    });

    it('Can fail validation', () => {
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('2');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('3');

      // Expect this command to fail for having no meta.
      expect(() => {
        scene.repo.execCliCommand('stack validate -q');
      }).to.throw(Error);
    });

    xit('Can pass validation if child branch points to same commit as parent', () => {
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.execCliCommand('upstack onto main');

      expect(() => {
        scene.repo.execCliCommand('stack validate -q');
      }).to.not.throw(Error);

      scene.repo.checkoutBranch('main');

      expect(() => {
        scene.repo.execCliCommand('stack validate -q');
      }).to.not.throw(Error);
    });
  });
}
