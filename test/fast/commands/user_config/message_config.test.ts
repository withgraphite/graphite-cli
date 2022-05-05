import { expect } from 'chai';
import fs from 'fs-extra';
import { BasicScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): upgrade message`, function () {
    configureTest(this, scene);

    it('Sanity check - can read previously written message config', () => {
      const contents = 'Hello world!';
      const cliVersion = '0.0.0';
      scene.context.messageConfig.update(
        (data) =>
          (data.message = {
            contents: contents,
            cliVersion: cliVersion,
          })
      );

      const writtenContents =
        scene.context.messageConfig.data.message?.contents;
      const wirttenCLIVersion =
        scene.context.messageConfig.data.message?.cliVersion;
      expect(writtenContents === contents).to.be.true;
      expect(wirttenCLIVersion === cliVersion).to.be.true;
    });

    it('If no message, removes message config file', () => {
      scene.context.messageConfig.update((d) => (d.message = undefined));
      expect(fs.existsSync(scene.context.messageConfig.path)).to.be.false;

      // can handle removing the file "twice"
      scene.context.messageConfig.update((d) => (d.message = undefined));
      expect(fs.existsSync(scene.context.messageConfig.path)).to.be.false;
    });

    after(() => {
      // Make sure we clean up any temporary contents we wrote to the file.
      // Unlike the auth token, we don't need to worry about re-creating it
      // since the next run of the CLI will just re-fetch the upgrade prompt.
      if (fs.existsSync(scene.context.messageConfig.path)) {
        fs.unlinkSync(scene.context.messageConfig.path);
      }
    });
  });
}
