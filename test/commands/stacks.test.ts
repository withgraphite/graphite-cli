import { expect } from 'chai';
import { allScenes } from '../lib/scenes/all_scenes';
import { configureTest } from '../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): log short`, function () {
    configureTest(this, scene);

    it('Can log short', () => {
      expect(() => scene.repo.runCliCommand([`ls`])).to.not.throw(Error);
    });

    it("Can print stacks if a branch's parent has been deleted", () => {
      scene.repo.createChange('a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
      scene.repo.deleteBranch('a');

      scene.repo.checkoutBranch('main');
      scene.repo.createChangeAndCommit('2', '2');

      expect(() => scene.repo.runCliCommandAndGetOutput([`ls`])).to.not.throw(
        Error
      );
    });
  });
}
