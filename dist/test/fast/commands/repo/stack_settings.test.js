"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../../lib/scenes/basic_scene");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): log settings tests`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can read settings written using the CLI commands', () => {
            scene.repo.execCliCommand('repo max-stacks-behind-trunk -s 1');
            scene.repo.execCliCommand('repo max-days-behind-trunk -s 2');
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput('repo max-stacks-behind-trunk')
                .includes('1')).to.be.true;
            chai_1.expect(scene.repo
                .execCliCommandAndGetOutput('repo max-days-behind-trunk')
                .includes('2')).to.be.true;
        });
    });
}
//# sourceMappingURL=stack_settings.test.js.map