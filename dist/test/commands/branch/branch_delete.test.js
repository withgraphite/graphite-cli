"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_branches_1 = require("../../lib/utils/expect_branches");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch delete`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can run branch delete', () => {
            const branchName = 'a';
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.runCliCommand([
                `branch`,
                `create`,
                branchName,
                `-m`,
                branchName,
            ]);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal(branchName);
            scene.repo.checkoutBranch('main');
            scene.repo.runCliCommand([`branch`, `delete`, branchName, `-f`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'main');
        });
    });
}
//# sourceMappingURL=branch_delete.test.js.map