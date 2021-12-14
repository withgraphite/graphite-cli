"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): continue upstack onto`, function () {
        (0, utils_1.configureTest)(this, scene);
        it('Can continue an upstack onto with single merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.execCliCommand('upstack onto a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            const output = scene.repo.execCliCommandAndGetOutput('continue --no-edit');
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
            (0, utils_1.expectCommits)(scene.repo, 'b, a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            output.includes('Successfully moved');
        });
        it('Can run continue multiple times on an upstack onto with multiple merge conflicts', () => {
            scene.repo.createChange('a', '1');
            scene.repo.createChange('a', '2');
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b', '1');
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.createChange('c', '2');
            scene.repo.execCliCommand("branch create 'c' -m 'c' -q");
            scene.repo.checkoutBranch('b');
            scene.repo.execCliCommand('upstack onto a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand('continue --no-edit');
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
            (0, utils_1.expectCommits)(scene.repo, 'b, a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            // Ensure that the upstack worked too (verify integrity of entire stack).
            scene.repo.checkoutBranch('c');
            (0, utils_1.expectCommits)(scene.repo, 'c, b, a');
        });
    });
}
//# sourceMappingURL=onto_continue.test.js.map