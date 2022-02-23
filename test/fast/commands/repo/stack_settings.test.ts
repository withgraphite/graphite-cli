import { expect } from 'chai';
import { BasicScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): log settings tests`, function () {
    configureTest(this, scene);

    it('Can read settings written using the CLI commands', () => {
      scene.repo.execCliCommand('repo max-stacks-behind-trunk -s 1');
      scene.repo.execCliCommand('repo max-days-behind-trunk -s 2');

      expect(
        scene.repo
          .execCliCommandAndGetOutput('repo max-stacks-behind-trunk')
          .includes('1')
      ).to.be.true;

      expect(
        scene.repo
          .execCliCommandAndGetOutput('repo max-days-behind-trunk')
          .includes('2')
      ).to.be.true;
    });
  });
}
