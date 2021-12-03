"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): stack fix`, function () {
        utils_1.configureTest(this, scene);
        it("Can continue a stack fix with single merge conflict", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange("b");
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.checkoutBranch("a");
            scene.repo.createChangeAndAmend("1");
            scene.repo.execCliCommand("stack fix --rebase -q");
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand("continue --no-edit");
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            chai_1.expect(scene.repo.currentBranchName()).to.equal("a");
            utils_1.expectCommits(scene.repo, "a, 1");
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.false;
            // Expect that the stack was also put back together. Note that
            // the 2 'a' commits are correct here - because the end happened
            // outside of our ecosystem, there was nothing to tag these as
            // duplicates.
            scene.repo.checkoutBranch("b");
            utils_1.expectCommits(scene.repo, "b, a, a");
        });
        it("Can run continue multiple times on a stack fix with multiple merge conflicts", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand("branch create 'a' -m 'a' -q");
            scene.repo.createChange("b");
            scene.repo.execCliCommand("branch create 'b' -m 'b' -q");
            scene.repo.createChange("c");
            scene.repo.execCliCommand("branch create 'c' -m 'c' -q");
            scene.repo.checkoutBranch("a");
            scene.repo.createChangeAndAmend("a1");
            scene.repo.checkoutBranch("b");
            scene.repo.createChangeAndAmend("b1");
            scene.repo.checkoutBranch("a");
            scene.repo.execCliCommand("stack fix --rebase -q");
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand("continue --no-edit");
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.execCliCommand("continue --no-edit");
            // Note that even though multiple continues have been run, the original
            // context - that the original stack fix was kicked off at 'a' - should
            // not be lost.
            chai_1.expect(scene.repo.currentBranchName()).to.equal("a");
            utils_1.expectCommits(scene.repo, "a, 1");
            chai_1.expect(scene.repo.rebaseInProgress()).to.be.false;
            scene.repo.checkoutBranch("c");
            utils_1.expectCommits(scene.repo, "c, b, b, a, a");
        });
    });
}
//# sourceMappingURL=fix_continue.test.js.map