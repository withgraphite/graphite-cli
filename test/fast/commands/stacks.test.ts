import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): log short`, function () {
    configureTest(this, scene);

    it('Can log short', () => {
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
    });

    it("Can print stacks if a branch's parent has been deleted", () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create a -m "a"`);
      scene.repo.createChange('b');
      scene.repo.execCliCommand(`branch create b -m "b"`);
      scene.repo.deleteBranch('a');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('2', '2');

      expect(() =>
        scene.repo.execCliCommandAndGetOutput(`log short`)
      ).to.not.throw(Error);
    });
  });
}
