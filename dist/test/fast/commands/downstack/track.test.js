"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): branch track`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('can force track a series of 3 branches', () => {
            // Create our branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a', 'a');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('b', 'b');
            scene.repo.createAndCheckoutBranch('c');
            scene.repo.createChangeAndCommit('c', 'c');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('downstack track -f --debug');
            }).not.to.throw();
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch down');
            }).not.to.throw();
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('b');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch down');
            }).not.to.throw();
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch down');
            }).not.to.throw();
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
        });
    });
}
//# sourceMappingURL=track.test.js.map