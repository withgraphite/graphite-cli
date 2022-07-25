"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): upstack onto`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can fix a leaf stack onto main', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.createChange('3', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `3`]);
            scene.repo.runCliCommand([`upstack`, `onto`, `main`]);
            (0, expect_commits_1.expectCommits)(scene.repo, '3, 1');
        });
        it('Can catch a merge conflict on first rebase', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `2`]);
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('3', 'a');
            scene.repo.checkoutBranch('a');
            (0, chai_1.expect)(() => {
                scene.repo.runCliCommand([`upstack`, `onto`, `main`]);
            }).to.throw();
            (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
        });
    });
}
//# sourceMappingURL=onto.test.js.map