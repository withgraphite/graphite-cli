"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sync_1 = require("../../src/actions/sync/sync");
const push_branch_1 = require("../../src/lib/git/push_branch");
const clone_scene_1 = require("../lib/scenes/clone_scene");
const configure_test_1 = require("../lib/utils/configure_test");
for (const scene of [new clone_scene_1.CloneScene()]) {
    // eslint-disable-next-line max-lines-per-function
    describe('handle remote actions properly (sync/submit)', function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('can push a branch to remote', async () => {
            scene.repo.createChange('1');
            scene.repo.runCliCommand([`branch`, `create`, `1`, `-am`, `1`]);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('1');
            (0, push_branch_1.pushBranch)({
                remote: 'origin',
                branchName: '1',
                noVerify: false,
                forcePush: false,
            });
            (0, chai_1.expect)(scene.repo.getRef('refs/heads/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
        });
        it('fails to push to a branch with external commits', () => {
            scene.repo.createChange('1');
            scene.repo.runCliCommand([`branch`, `create`, `1`, `-am`, `1`]);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('1');
            scene.originRepo.createChange('2');
            scene.originRepo.runCliCommand([`branch`, `create`, `1`, `-am`, `1`]);
            (0, chai_1.expect)(scene.originRepo.getRef('refs/heads/1')).to.not.equal(scene.repo.getRef('refs/heads/1'));
            (0, chai_1.expect)(() => (0, push_branch_1.pushBranch)({
                remote: 'origin',
                branchName: '1',
                noVerify: false,
                forcePush: false,
            })).to.throw();
        });
        it('can pull trunk from remote', async () => {
            scene.originRepo.createChangeAndCommit('a');
            await (0, sync_1.syncAction)({
                pull: true,
                force: false,
                delete: false,
                showDeleteProgress: false,
                restack: false,
            }, scene.getContext());
            (0, chai_1.expect)(scene.repo.getRef('refs/heads/main')).to.equal(scene.originRepo.getRef('refs/heads/main'));
        });
        // TODO test downstack sync actions
    });
}
//# sourceMappingURL=remote_actions.test.js.map