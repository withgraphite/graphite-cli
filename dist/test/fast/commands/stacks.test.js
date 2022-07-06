"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): log short`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can log short', () => {
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
        it("Can print stacks if a branch's parent has been deleted", () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create a -m "a"`);
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create b -m "b"`);
            scene.repo.deleteBranch('a');
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('2', '2');
            (0, chai_1.expect)(() => scene.repo.execCliCommandAndGetOutput(`log short`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=stacks.test.js.map