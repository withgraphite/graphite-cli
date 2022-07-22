"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): restack continue`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can abort a restack with a merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndAmend('1');
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['stack', 'restack', '-q'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.runGitCommand(['rebase', '--abort']);
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            (0, chai_1.expect)(scene.getContext().metaCache.currentBranchPrecondition).to.equal('b');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
        });
        it('Can continue a stack restack with single merge conflict', () => {
            scene.repo.createChange('a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndAmend('1');
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['stack', 'restack', '-q'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.runCliCommand(['continue']);
            // Continue should finish the work that stack restack started, not only
            // completing the rebase but also re-checking out the original
            // branch.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
        });
        it('Can run continue multiple times on a stack restack with multiple merge conflicts', () => {
            scene.repo.createChange('a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.createChange('c');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndAmend('a1');
            scene.repo.checkoutBranch('b');
            scene.repo.createChangeAndAmend('b1');
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['stack', 'restack', '-q'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.runCliCommand(['continue']);
            // Note that even though multiple continues have been run, the original
            // context - that the original stack restack was kicked off at 'a' - should
            // not be lost.
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a, 1');
        });
    });
}
//# sourceMappingURL=restack_continue.test.js.map