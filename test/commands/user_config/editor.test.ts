import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user editor`, function () {
    configureTest(this, scene);

    it('Sanity check - can check editor', () => {
      expect(() => scene.repo.runCliCommand([`user`, `editor`])).to.not.throw(
        Error
      );
    });

    it('Sanity check - can set editor', () => {
      expect(
        scene.repo.runCliCommandAndGetOutput([`user`, `editor`, `--set`, `vim`])
      ).to.equal('Editor set to vim');
      expect(scene.repo.runCliCommandAndGetOutput([`user`, `editor`])).to.equal(
        'vim'
      );
    });

    it('Sanity check - can unset editor', () => {
      process.env.GIT_EDITOR = 'vi';
      expect(
        scene.repo.runCliCommandAndGetOutput([`user`, `editor`, `--unset`])
      ).to.equal(
        'Editor preference erased. Defaulting to your git editor (currently vi)'
      );
    });
  });
}
