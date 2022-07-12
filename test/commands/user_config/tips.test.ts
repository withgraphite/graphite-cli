import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user tips`, function () {
    configureTest(this, scene);

    it('Sanity check - can enable tips', () => {
      expect(() =>
        scene.repo.execCliCommand(`user tips --enable`)
      ).to.not.throw(Error);
      expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal(
        'tips enabled'
      );
    });

    it('Sanity check - can disable tips', () => {
      expect(() =>
        scene.repo.execCliCommand(`user tips --disable`)
      ).to.not.throw(Error);
      expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal(
        'tips disabled'
      );
    });
  });
}
