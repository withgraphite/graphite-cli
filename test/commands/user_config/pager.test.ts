import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user pager`, function () {
    configureTest(this, scene);

    it('Sanity check - can check pager', () => {
      expect(() => scene.repo.runCliCommand([`user`, `pager`])).to.not.throw(
        Error
      );
    });

    it('Sanity check - can set pager', () => {
      expect(
        scene.repo.runCliCommandAndGetOutput([
          `user`,
          `pager`,
          `--set`,
          `less -FRX`,
        ])
      ).to.equal('Pager set to less -FRX');
      expect(scene.repo.runCliCommandAndGetOutput([`user`, `pager`])).to.equal(
        'less -FRX'
      );
    });

    it('Sanity check - can disable pager', () => {
      expect(
        scene.repo.runCliCommandAndGetOutput([`user`, `pager`, `--disable`])
      ).to.equal('Pager disabled');
      expect(scene.repo.runCliCommandAndGetOutput([`user`, `pager`])).to.equal(
        'Pager is disabled'
      );
    });

    it('Sanity check - can unset pager', () => {
      process.env.TEST_GT_PAGER = 'less';
      expect(
        scene.repo.runCliCommandAndGetOutput([`user`, `pager`, `--unset`])
      ).to.equal(
        'Pager preference erased. Defaulting to your git pager (currently less)'
      );
    });
  });
}
