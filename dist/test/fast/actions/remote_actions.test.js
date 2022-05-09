"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const push_branches_1 = require("../../../src/actions/submit/push_branches");
const push_metadata_1 = require("../../../src/actions/submit/push_metadata");
const merge_downstack_1 = require("../../../src/actions/sync/merge_downstack");
const prune_remote_branch_metadata_1 = require("../../../src/actions/sync/prune_remote_branch_metadata");
const pull_1 = require("../../../src/actions/sync/pull");
const exec_state_config_1 = require("../../../src/lib/config/exec_state_config");
const branch_1 = require("../../../src/wrapper-classes/branch");
const clone_scene_1 = require("../../lib/scenes/clone_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new clone_scene_1.CloneScene()]) {
    // eslint-disable-next-line max-lines-per-function
    describe('handle remote actions properly (sync/submit)', function () {
        configure_test_1.configureTest(this, scene);
        it('can push a branch and its metadata to remote', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('1');
            scene.repo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('1');
            yield push_metadata_1.pushMetadata(push_branches_1.pushBranchesToRemote([new branch_1.Branch('1')], scene.context), scene.context);
            chai_1.expect(scene.repo.getRef('refs/heads/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
            chai_1.expect(scene.repo.getRef('refs/branch-metadata/1')).to.equal(scene.originRepo.getRef('refs/branch-metadata/1'));
        }));
        it('fails to push to a branch with external commits', () => {
            scene.repo.createChange('1');
            scene.repo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('1');
            scene.originRepo.createChange('2');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.originRepo.getRef('refs/heads/1')).to.not.equal(scene.repo.getRef('refs/heads/1'));
            chai_1.expect(() => push_branches_1.pushBranchesToRemote([new branch_1.Branch('1')], scene.context)).to.throw();
        });
        it('can fetch a branch and its metadata from remote', () => __awaiter(this, void 0, void 0, function* () {
            scene.originRepo.createChangeAndCommit('a');
            scene.originRepo.createChange('1');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            pull_1.pull(scene.context, scene.repo.currentBranchName());
            yield prune_remote_branch_metadata_1.pruneRemoteBranchMetadata(scene.context, true);
            chai_1.expect(scene.repo.getRef('refs/heads/main')).to.equal(scene.originRepo.getRef('refs/heads/main'));
            chai_1.expect(scene.repo.getRef('refs/remotes/origin/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
            chai_1.expect(scene.repo.getRef('refs/origin-branch-metadata/1')).to.equal(scene.originRepo.getRef('refs/branch-metadata/1'));
            scene.originRepo.checkoutBranch('main');
            scene.originRepo.execGitCommand(`branch -D 1`);
            pull_1.pull(scene.context, scene.repo.currentBranchName());
            yield prune_remote_branch_metadata_1.pruneRemoteBranchMetadata(scene.context, true);
            chai_1.expect(scene.repo.getRef('refs/origin-branch-metadata/1')).to.be
                .undefined;
            chai_1.expect(scene.originRepo.getRef('refs/branch-metadata/1')).to.be.undefined;
        }));
        it('can sync a remote stack', () => __awaiter(this, void 0, void 0, function* () {
            scene.originRepo.createChange('1');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            scene.originRepo.createChange('2');
            scene.originRepo.execCliCommand(`branch create 2 -am "2"`);
            pull_1.pull(scene.context, scene.repo.currentBranchName());
            chai_1.expect(scene.repo.getRef('refs/remotes/origin/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
            chai_1.expect(scene.repo.getRef('refs/origin-branch-metadata/1')).to.equal(scene.originRepo.getRef('refs/branch-metadata/1'));
            chai_1.expect(scene.repo.getRef('refs/remotes/origin/2')).to.equal(scene.originRepo.getRef('refs/heads/2'));
            chai_1.expect(scene.repo.getRef('refs/origin-branch-metadata/2')).to.equal(scene.originRepo.getRef('refs/branch-metadata/2'));
            yield merge_downstack_1.mergeDownstack('2', scene.context);
            chai_1.expect(scene.repo.getRef('refs/heads/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
            chai_1.expect(scene.repo.getRef('refs/branch-metadata/1')).to.equal(scene.originRepo.getRef('refs/branch-metadata/1'));
            chai_1.expect(scene.repo.getRef('refs/heads/2')).to.equal(scene.originRepo.getRef('refs/heads/2'));
            chai_1.expect(scene.repo.getRef('refs/branch-metadata/2')).to.equal(scene.originRepo.getRef('refs/branch-metadata/2'));
        }));
        it("doesn't sync a branch with a local copy", () => __awaiter(this, void 0, void 0, function* () {
            scene.originRepo.createChange('1');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            scene.repo.createChange('2');
            scene.repo.execCliCommand(`branch create 1 -am "1"`);
            scene.repo.execCliCommand(`branch checkout main`);
            pull_1.pull(scene.context, scene.repo.currentBranchName());
            exec_state_config_1.execStateConfig._data.interactive = false;
            yield merge_downstack_1.mergeDownstack('1', scene.context);
            chai_1.expect(scene.repo.getRef('refs/heads/1')).to.not.equal(scene.originRepo.getRef('refs/heads/1'));
        }));
    });
}
//# sourceMappingURL=remote_actions.test.js.map