"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): rename`, function () {
        utils_1.configureTest(this, scene);
        it('Can rename a branch', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('a');
            scene.repo.execCliCommand(`branch rename a1`);
            scene.repo.checkoutBranch('b');
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('a1');
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('main');
            chai_1.expect(() => scene.repo.execCliCommand(`stack validate`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=branch_rename.test.js.map