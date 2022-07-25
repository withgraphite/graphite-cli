"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): upgrade message`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Sanity check - can read previously written message config', () => {
            const contents = 'Hello world!';
            const cliVersion = '0.0.0';
            scene.getContext().messageConfig.update((data) => (data.message = {
                contents: contents,
                cliVersion: cliVersion,
            }));
            const writtenContents = scene.getContext().messageConfig.data.message?.contents;
            const wirttenCLIVersion = scene.getContext().messageConfig.data.message?.cliVersion;
            (0, chai_1.expect)(writtenContents === contents).to.be.true;
            (0, chai_1.expect)(wirttenCLIVersion === cliVersion).to.be.true;
        });
        it('If no message, removes message config file', () => {
            scene.getContext().messageConfig.update((d) => (d.message = undefined));
            (0, chai_1.expect)(fs_extra_1.default.existsSync(scene.getContext().messageConfig.path)).to.be.false;
            // can handle removing the file "twice"
            scene.getContext().messageConfig.update((d) => (d.message = undefined));
            (0, chai_1.expect)(fs_extra_1.default.existsSync(scene.getContext().messageConfig.path)).to.be.false;
        });
    });
}
//# sourceMappingURL=message_config.test.js.map