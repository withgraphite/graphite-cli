"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): commit amend`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can amend a commit', () => {
            scene.repo.createChange('2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            (0, expect_commits_1.expectCommits)(scene.repo, '2, 1');
            scene.repo.runCliCommand([`commit`, `amend`, `-m`, `3`]);
            (0, expect_commits_1.expectCommits)(scene.repo, '3, 1');
        });
        it('Can amend if there are no staged changes', () => {
            scene.repo.createChange('2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.runCliCommand([`commit`, `amend`, `-m`, `b`]);
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, 1');
        });
        it('Automatically restacks upwards', () => {
            scene.repo.createChange('2', '2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChange('3', '3');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            scene.repo.checkoutBranch('a');
            scene.repo.runCliCommand([`commit`, `amend`, `-m`, `2.5`]);
            scene.repo.checkoutBranch('b');
            (0, expect_commits_1.expectCommits)(scene.repo, '3, 2.5, 1');
        });
        it('Restacks correctly when there are merge conflicts', () => {
            const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
            scene.repo.createChange(lorem);
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange(['b', lorem].join('\n'));
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.checkoutBranch('a');
            scene.repo.createChange(`Hello world! ${lorem}`);
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`commit`, `amend`, `-m`, `a1`])).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            scene.repo.resolveMergeConflicts();
            scene.repo.markMergeConflictsAsResolved();
            scene.repo.runCliCommand([`continue`]);
            scene.repo.checkoutBranch('b');
            // Notably, the old commit that became a1 should *not* be in this list;
            // Graphite should have associated that a became a1 and made sure that
            // as we upstacked branch 'b' that commit 'a' was dropped.
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a1, 1');
        });
        it('Can amend a commit with a multi-word commit message', () => {
            scene.repo.createChange('2');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.runCliCommand([`commit`, `amend`, `-m`, `a b c`]);
            (0, expect_commits_1.expectCommits)(scene.repo, 'a b c');
        });
    });
}
//# sourceMappingURL=amend.test.js.map