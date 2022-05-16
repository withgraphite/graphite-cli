"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): stack validate`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can pass validation', () => {
            scene.repo.createChange('2');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('3');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            // Expect this command not to fail.
            scene.repo.execCliCommand('stack validate -q');
        });
        it('Can fail validation', () => {
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('2');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('3');
            // Expect this command to fail for having no meta.
            chai_1.expect(() => {
                scene.repo.execCliCommand('stack validate -q');
            }).to.throw(Error);
        });
        xit('Can pass validation if child branch points to same commit as parent', () => {
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.execCliCommand('upstack onto main');
            chai_1.expect(() => {
                scene.repo.execCliCommand('stack validate -q');
            }).to.not.throw(Error);
            scene.repo.checkoutBranch('main');
            chai_1.expect(() => {
                scene.repo.execCliCommand('stack validate -q');
            }).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=validate.test.js.map