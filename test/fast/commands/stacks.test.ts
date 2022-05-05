import { expect } from 'chai';
import { allScenes } from '../../lib/scenes';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): log short`, function () {
    configureTest(this, scene);

    it('Can log short', () => {
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
    });

    it("Can print stacks if a branch's parent has been deleted", () => {
      scene.repo.createAndCheckoutBranch('a');
      scene.repo.createChangeAndCommit('a', 'a');
      scene.repo.createAndCheckoutBranch('b');
      scene.repo.createChangeAndCommit('b', 'b');
      scene.repo.execCliCommand(`branch parent --set a`);
      scene.repo.deleteBranch('a');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('2', '2');

      expect(() =>
        scene.repo.execCliCommandAndGetOutput(`log short`)
      ).to.not.throw(Error);
    });
  });
}
