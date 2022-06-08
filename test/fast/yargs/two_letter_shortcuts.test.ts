import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): two letter shortcuts`, function () {
    configureTest(this, scene);

    it("Can run 'bu' shortcut command", () => {
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.checkoutBranch('main');
      expect(() =>
        scene.repo.execCliCommand('bu --no-interactive')
      ).to.not.throw(Error);
    });
  });
}
