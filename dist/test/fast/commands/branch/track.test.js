"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): branch track`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can track and restack the current branch if previously untracked', () => {
            // Create our dangling branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a1', 'a1');
            scene.repo.createChangeAndCommit('a2', 'a2');
            scene.repo.createChangeAndCommit('a3', 'a3');
            // Move main forward
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('b', 'b');
            // we should be able to track the dangling branch 'a' while it's checked out
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p main');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'a3, a2, a1, 1');
            scene.repo.execCliCommand('branch restack');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a3, a2, a1, b, 1');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
        });
        it('Can track a branch, and then insert a branch before and track both as a stack', () => {
            // Create our branch
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('a', 'a');
            scene.repo.createChangeAndCommit('b', 'b');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p main');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
            scene.repo.execGitCommand('branch a b~');
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p main');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
            scene.repo.checkoutBranch('b');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p a');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            // Prove that meta is correctly updated.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('a');
        });
        it('Needs a rebase to track a branch that is created and whose parent is amended', () => {
            // Create our branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a', 'a');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('b', 'b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p main');
            }).not.to.throw();
            scene.repo.createChange('a1', 'a1');
            scene.repo.execGitCommand('commit --amend --no-edit');
            scene.repo.checkoutBranch('b');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p a');
            }).to.throw();
            scene.repo.execGitCommand('rebase a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -p a');
            }).to.not.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            // Prove that we have meta now.
            scene.repo.execCliCommand('branch down');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('a');
        });
        it('Tracks the most recent ancestor when `--force` is passed in', () => {
            // Create our branch
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.createChangeAndCommit('a', 'a');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -f');
            }).not.to.throw();
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch down');
            }).not.to.throw();
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
            scene.repo.execCliCommand('branch up');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.createChangeAndCommit('b', 'b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch track -f');
            }).not.to.throw();
            (0, chai_1.expect)(() => {
                scene.repo.execCliCommand('branch down');
            }).not.to.throw();
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('a');
        });
    });
}
//# sourceMappingURL=track.test.js.map