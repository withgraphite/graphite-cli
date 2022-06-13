"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch track`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can track and restack a dangling untracked branch', () => {
            // Create our dangling branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a1', 'a1');
            scene.repo.createChangeAndCommit('a2', 'a2');
            scene.repo.createChangeAndCommit('a3', 'a3');
            // Move main forward
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('b', 'b');
            // branch a is dangling now, but we should still be able to track it with main as parent
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track a');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'a3, a2, a1, 1');
            scene.repo.execCliCommand('branch restack');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a3, a2, a1, b, 1');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
        });
    });
}
//# sourceMappingURL=track.test.js.map