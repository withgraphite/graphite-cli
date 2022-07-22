"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_branches_1 = require("../../lib/utils/expect_branches");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch untrack`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can untrack a tracked branch', () => {
            // Create our branches
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, a, 1');
            // untracking doesn't actually delete the branch
            scene.repo.runCliCommand([`branch`, `untrack`, `b`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, main');
            // can't navigate from an untracked branch
            (0, chai_1.expect)(() => {
                scene.repo.runCliCommand([`branch`, `down`]);
            }).to.throw();
            // can't navigate to an untracked branch
            scene.repo.checkoutBranch('a');
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
            scene.repo.runCliCommand([`branch`, `up`]);
            (0, expect_commits_1.expectCommits)(scene.repo, 'a, 1');
        });
        it('Can untrack a tracked branch with children', () => {
            // Create our branches
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.createChange('c', 'c');
            scene.repo.runCliCommand([`branch`, `create`, `c`, `-m`, `c`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            (0, expect_commits_1.expectCommits)(scene.repo, 'c, b, a, 1');
            // untracking doesn't actually delete the branches
            scene.repo.runCliCommand([`branch`, `untrack`, `b`, `-f`]);
            (0, expect_branches_1.expectBranches)(scene.repo, 'a, b, c, main');
            scene.repo.checkoutBranch('c');
            // can't navigate from an untracked branch
            (0, chai_1.expect)(() => {
                scene.repo.runCliCommand([`branch`, `down`]);
            }).to.throw();
        });
    });
}
//# sourceMappingURL=untrack.test.js.map