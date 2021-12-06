import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes';
import { configureTest } from '../../lib/utils';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): two letter shortcuts`, function () {
    configureTest(this, scene);

    it("Can run 'bn' shortcut command", () => {
      scene.repo.execCliCommand(`branch create "a" -q`);
      scene.repo.checkoutBranch('main');
      expect(() =>
        scene.repo.execCliCommand('bn --no-interactive')
      ).to.not.throw(Error);
    });
  });
}
