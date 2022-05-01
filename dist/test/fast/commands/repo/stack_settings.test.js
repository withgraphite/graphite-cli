"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): log settings tests`, function () {
        utils_1.configureTest(this, scene);
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