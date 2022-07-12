import { expect } from 'chai';
import fs from 'fs-extra';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): upgrade message`, function () {
    configureTest(this, scene);

    it('Sanity check - can read previously written message config', () => {
      const contents = 'Hello world!';
      const cliVersion = '0.0.0';
      scene.getContext().messageConfig.update(
        (data) =>
          (data.message = {
            contents: contents,
            cliVersion: cliVersion,
          })
      );

      const writtenContents =
        scene.getContext().messageConfig.data.message?.contents;
      const wirttenCLIVersion =
        scene.getContext().messageConfig.data.message?.cliVersion;
      expect(writtenContents === contents).to.be.true;
      expect(wirttenCLIVersion === cliVersion).to.be.true;
    });

    it('If no message, removes message config file', () => {
      scene.getContext().messageConfig.update((d) => (d.message = undefined));
      expect(fs.existsSync(scene.getContext().messageConfig.path)).to.be.false;

      // can handle removing the file "twice"
      scene.getContext().messageConfig.update((d) => (d.message = undefined));
      expect(fs.existsSync(scene.getContext().messageConfig.path)).to.be.false;
    });
  });
}
