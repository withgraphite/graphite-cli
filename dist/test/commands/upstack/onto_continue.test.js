"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): continue upstack onto`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can continue an upstack onto with single merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['upstack', 'onto', 'a'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            const output = scene.repo.runCliCommandAndGetOutput(['continue']);
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            output.includes('Successfully moved');
        });
        it('Can run continue multiple times on an upstack onto with multiple merge conflicts', () => {
            scene.repo.createChange('a', '1');
            scene.repo.createChange('a', '2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b', '1');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.createChange('c', '2');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
            scene.repo.checkoutBranch('b');
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['upstack', 'onto', 'a'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.runCliCommand(['continue']);
            // Continue should finish the work that stack fix started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            // Ensure that the upstack worked too (verify integrity of entire stack).
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a');
        });
    });
}
//# sourceMappingURL=onto_continue.test.js.map