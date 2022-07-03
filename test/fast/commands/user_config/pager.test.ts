import { expect } from 'chai';
import { BasicScene } from '../../../lib/scenes/basic_scene';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user pager`, function () {
    configureTest(this, scene);

    it('Sanity check - can check pager', () => {
      expect(() => scene.repo.execCliCommand(`user pager`)).to.not.throw(Error);
    });

    it('Sanity check - can set pager', () => {
      scene.repo.execCliCommandAndGetOutput(`user pager --set "less -FRX"`);
      expect(scene.getContext().userConfig.getPager()).to.equal('less -FRX');
    });

    it('Sanity check - can unset pager', () => {
      scene.repo.execCliCommandAndGetOutput(`user pager --unset`);
      expect(scene.getContext().userConfig.data.pager).to.equal(undefined);
    });
  });
}
