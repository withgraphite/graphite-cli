"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): upstack onto`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can fix a leaf stack onto main', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            scene.repo.createChange('3', 'b');
            scene.repo.execCliCommand("branch create 'b' -m '3' -q");
            scene.repo.execCliCommand('upstack onto main -q');
            expect_commits_1.expectCommits(scene.repo, '3, 1');
            chai_1.expect(() => scene.repo.execCliCommand('validate -q')).not.to.throw;
        });
        it('Can gracefully catch a merge conflict on first rebase', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('3', 'a');
            scene.repo.checkoutBranch('a');
            chai_1.expect(() => {
                scene.repo.execCliCommand('upstack onto main -q');
            }).to.not.throw();
        });
        it('Can recover a branch that has no git and meta parents', () => {
            // Create our dangling branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a1', 'a1');
            scene.repo.createChangeAndCommit('a2', 'a2');
            scene.repo.createChangeAndCommit('a3', 'a3');
            // Move main forward
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('b', 'b');
            // branch a is dangling now, but we should still be able to "upstack onto" main
            scene.repo.checkoutBranch('a');
            chai_1.expect(() => {
                scene.repo.execCliCommand('upstack onto main');
            }).to.not.throw();
            expect_commits_1.expectCommits(scene.repo, 'a3, a2, a1, b, 1');
            scene.repo.checkoutBranch('a');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch prev --no-interactive');
            chai_1.expect(scene.repo.currentBranchName()).to.eq('main');
        });
    });
}
//# sourceMappingURL=onto.test.js.map