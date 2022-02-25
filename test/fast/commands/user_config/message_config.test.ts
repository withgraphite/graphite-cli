import { expect } from 'chai';
import fs from 'fs-extra';
import { messageConfigFactory } from '../../../../src/lib/config/message_config';
import { BasicScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): upgrade message`, function () {
    configureTest(this, scene);
    const messageConfig = messageConfigFactory.load();

    it('Sanity check - can read previously written message config', () => {
      const contents = 'Hello world!';
      const cliVersion = '0.0.0';
      messageConfig.update(
        (data) =>
          (data.message = {
            contents: contents,
            cliVersion: cliVersion,
          })
      );

      const writtenContents = messageConfig.data.message?.contents;
      const wirttenCLIVersion = messageConfig.data.message?.cliVersion;
      expect(writtenContents === contents).to.be.true;
      expect(wirttenCLIVersion === cliVersion).to.be.true;
    });

    it('If no message, removes message config file', () => {
      messageConfig.update((data) => (data.message = undefined));
      expect(fs.existsSync(messageConfig.path)).to.be.false;

      // can handle removing the file "twice"
      messageConfig.update((data) => (data.message = undefined));
      expect(fs.existsSync(messageConfig.path)).to.be.false;
    });

    after(() => {
      // Make sure we clean up any temporary contents we wrote to the file.
      // Unlike the auth token, we don't need to worry about re-creating it
      // since the next run of the CLI will just re-fetch the upgrade prompt.
      if (fs.existsSync(messageConfig.path)) {
        fs.unlinkSync(messageConfig.path);
      }
    });
  });
}
