"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch create`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can checkout a branch', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create a -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.execCliCommand(`branch checkout a`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('a');
        });
    });
}
//# sourceMappingURL=branch_checkout.test.js.map