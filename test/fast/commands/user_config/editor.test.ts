import { expect } from 'chai';
import { BasicScene } from '../../../lib/scenes/basic_scene';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user editor`, function () {
    configureTest(this, scene);

    it('Sanity check - can check editor', () => {
      expect(() => scene.repo.execCliCommand(`user editor`)).to.not.throw(
        Error
      );
    });

    it('Sanity check - can set editor', () => {
      scene.repo.execCliCommandAndGetOutput(`user editor --set vim`);
      expect(scene.getContext().userConfig.getEditor()).to.equal('vim');
    });

    it('Sanity check - can unset editor', () => {
      scene.repo.execCliCommandAndGetOutput(`user editor --unset`);
      expect(scene.getContext().userConfig.data.editor).to.equal(undefined);
    });
  });
}
