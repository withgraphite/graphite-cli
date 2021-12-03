"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("../../../../src/lib/config");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): upgrade message`, function () {
        utils_1.configureTest(this, scene);
        it("Sanity check - can read previously written message config", () => {
            var _a, _b;
            const contents = "Hello world!";
            const cliVersion = "0.0.0";
            config_1.messageConfig.setMessage({
                contents: contents,
                cliVersion: cliVersion,
            });
            const writtenMessageConfig = config_1.readMessageConfigForTestingOnly();
            const writtenContents = (_a = writtenMessageConfig.getMessage()) === null || _a === void 0 ? void 0 : _a.contents;
            const wirttenCLIVersion = (_b = writtenMessageConfig.getMessage()) === null || _b === void 0 ? void 0 : _b.cliVersion;
            chai_1.expect(writtenContents === contents).to.be.true;
            chai_1.expect(wirttenCLIVersion === cliVersion).to.be.true;
        });
        it("If no message, removes message config file", () => {
            config_1.messageConfig.setMessage(undefined);
            chai_1.expect(fs_extra_1.default.existsSync(config_1.messageConfig.path())).to.be.false;
            // can handle removing the file "twice"
            config_1.messageConfig.setMessage(undefined);
            chai_1.expect(fs_extra_1.default.existsSync(config_1.messageConfig.path())).to.be.false;
        });
        after(() => {
            // Make sure we clean up any temporary contents we wrote to the file.
            // Unlike the auth token, we don't need to worry about re-creating it
            // since the next run of the CLI will just re-fetch the upgrade prompt.
            if (fs_extra_1.default.existsSync(config_1.messageConfig.path())) {
                fs_extra_1.default.unlinkSync(config_1.messageConfig.path());
            }
        });
    });
}
//# sourceMappingURL=message_config.js.map