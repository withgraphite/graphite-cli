"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): upstack restack`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can restack a stack of three branches', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChangeAndCommit('2.5', 'a.5');
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            scene.repo.createChangeAndCommit('3.5', 'b.5');
            scene.repo.createChange('4', 'c');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `4`]);
            (0, expect_commits_1.expectCommits)(scene.repo, '4, 3.5, 3, 2.5, 2, 1');
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('1.5', 'main');
            (0, chai_1.expect)(scene.repo.listCurrentBranchCommitMessages().slice(0, 2).join(', ')).to.equal('1.5, 1');
            scene.repo.runCliCommand(['upstack', 'restack']);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('main');
            scene.repo.checkoutBranch('c');
            (0, expect_commits_1.expectCommits)(scene.repo, '4, 3.5, 3, 2.5, 2, 1.5, 1');
        });
        it('Can handle merge conflicts', () => {
            scene.repo.createChange('2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChange('3');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('1.5');
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['upstack', 'restack'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.eq(true);
            scene.repo.resolveMergeConflicts();
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue', '-q'])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.eq(true);
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.runCliCommand(['continue', '-q']);
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.eq(false);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('main');
            scene.repo.checkoutBranch('b');
            (0, chai_1.expect)(scene.repo.listCurrentBranchCommitMessages().slice(0, 4).join(', ')).to.equal('3, 2, 1.5, 1');
        });
        it('Can restack one specific stack', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndCommit('1.5', '1.5');
            scene.repo.runCliCommand(['upstack', 'restack']);
            scene.repo.checkoutBranch('b');
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, 1.5, a, 1');
        });
        it("Doesn't restack below current commit", () => {
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndCommit('2.5', '2.5');
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('1.5', '1.5');
            scene.repo.checkoutBranch('b');
            scene.repo.runCliCommand(['upstack', 'restack']);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.eq('b');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, 2.5, a, 1');
        });
    });
}
//# sourceMappingURL=restack.test.js.map