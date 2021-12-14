"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): commit create continue`, function () {
        (0, utils_1.configureTest)(this, scene);
        it('Can continue a commit create with single merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange('b');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.checkoutBranch('a');
            scene.repo.createChange('1');
            scene.repo.execCliCommand("commit create -m 'c' -q");
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, utils_1.expectCommits)(scene.repo, 'c, a, 1');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            // Expect that the stack was also put back together.
            scene.repo.checkoutBranch('b');
            (0, utils_1.expectCommits)(scene.repo, 'b, c, a');
        });
        it('Can run continue multiple times on a commit create with multiple merge conflicts', () => {
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
            scene.repo.execCliCommand("commit create -m 'a12' -q");
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            // Note that even though multiple continues have been run, the original
            // context - that the original commit amend was kicked off at 'a' -
            // should not be lost.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, utils_1.expectCommits)(scene.repo, 'a12, a, 1');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            scene.repo.checkoutBranch('c');
            (0, utils_1.expectCommits)(scene.repo, 'c, b, a12, a');
        });
    });
}
//# sourceMappingURL=create_continue.test.js.map