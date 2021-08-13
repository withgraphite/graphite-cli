import { expect } from "chai";
import fs from "fs-extra";
import {
  messageConfig,
  readMessageConfigForTestingOnly,
} from "../../../src/lib/config";
import { BasicScene } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): upgrade message`, function () {
    configureTest(this, scene);

    it("Sanity check - can read previously written message config", () => {
      const contents = "Hello world!";
      const cliVersion = "0.0.0";
      messageConfig.setMessage({
        contents: contents,
        cliVersion: cliVersion,
      });

      const writtenMessageConfig = readMessageConfigForTestingOnly();
      const writtenContents = writtenMessageConfig.getMessage()?.contents;
      const wirttenCLIVersion = writtenMessageConfig.getMessage()?.cliVersion;
      expect(writtenContents === contents).to.be.true;
      expect(wirttenCLIVersion === cliVersion).to.be.true;
    });

    it("If no message, removes message config file", () => {
      messageConfig.setMessage(undefined);
      expect(fs.existsSync(messageConfig.path())).to.be.false;

      // can handle removing the file "twice"
      messageConfig.setMessage(undefined);
      expect(fs.existsSync(messageConfig.path())).to.be.false;
    });

    after(() => {
      // Make sure we clean up any temporary contents we wrote to the file.
      // Unlike the auth token, we don't need to worry about re-creating it
      // since the next run of the CLI will just re-fetch the upgrade prompt.
      if (fs.existsSync(messageConfig.path())) {
        fs.unlinkSync(messageConfig.path());
      }
    });
  });
}
