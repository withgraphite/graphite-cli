"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_commits_1 = require("../../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): commit amend continue`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can continue a commit amend with single merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange('b');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.checkoutBranch('a');
            scene.repo.createChange('1');
            (0, chai_1.expect)(() => scene.repo.execCliCommand("commit amend -m 'c' -q")).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue');
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, 1');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            // Expect that the stack was also put back together.
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, c');
        });
        it('Can run continue multiple times on a commit amend with multiple merge conflicts', () => {
            scene.repo.createChange('a', '1');
            scene.repo.createChange('a', '2');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange('b', '1');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.createChange('c', '2');
            scene.repo.execCliCommand("branch create 'c' -m 'c' -q");
            scene.repo.checkoutBranch('a');
            scene.repo.createChange('1', '1');
            scene.repo.createChange('2', '2');
            (0, chai_1.expect)(() => scene.repo.execCliCommand("commit amend -m 'a12' -q")).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            (0, chai_1.expect)(() => scene.repo.execCliCommand('continue')).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue');
            // Note that even though multiple continues have been run, the original
            // context - that the original commit amend was kicked off at 'a' -
            // should not be lost.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a12, 1');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a12');
        });
    });
}
//# sourceMappingURL=amend_continue.test.js.map