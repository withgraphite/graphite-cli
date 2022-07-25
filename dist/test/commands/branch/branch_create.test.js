"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const git_status_utils_1 = require("../../../src/lib/git/git_status_utils");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
const expect_commits_1 = require("../../lib/utils/expect_commits");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch create`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can run branch create', () => {
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.runCliCommand(['branch', 'down']);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('main');
        });
        it('Can rollback changes on a failed commit hook', () => {
            // Aggressive AF commit hook from your angry coworker
            scene.repo.createPrecommitHook('exit 1');
            scene.repo.createChange('2');
            (0, chai_1.expect)(() => {
                scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            }).to.throw(Error);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('main');
        });
        it('Can create a branch without providing a name', () => {
            scene.repo.createChange('2');
            scene.repo.runCliCommand([`branch`, `create`, `-m`, `feat(test): info`]);
            (0, chai_1.expect)(scene.repo.currentBranchName().includes('feat_test_info')).to.be
                .true;
        });
        it('Can create a branch with add all option', () => {
            scene.repo.createChange('23', 'test', true);
            (0, chai_1.expect)((0, git_status_utils_1.unstagedChanges)()).to.be.true;
            scene.repo.runCliCommand([
                `branch`,
                `create`,
                `test-branch`,
                `-m`,
                `add all`,
                `-a`,
            ]);
            (0, chai_1.expect)((0, git_status_utils_1.unstagedChanges)()).to.be.false;
        });
        it('Can restack its parents children', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.createChange('b', 'b');
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            scene.repo.runCliCommand(['bd']);
            scene.repo.createChange('c', 'c');
            scene.repo.runCliCommand([
                `branch`,
                `create`,
                `c`,
                `-m`,
                `c`,
                `--insert`,
            ]);
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['branch', 'up'])).not.to.throw();
            (0, expect_commits_1.expectCommits)(scene.repo, 'b, c, a');
        });
    });
}
//# sourceMappingURL=branch_create.test.js.map