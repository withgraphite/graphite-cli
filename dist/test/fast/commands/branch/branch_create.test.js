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
const git_status_utils_1 = require("../../../../src/lib/utils/git_status_utils");
const branch_1 = require("../../../../src/wrapper-classes/branch");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch create`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can run branch create', () => {
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('a');
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.execCliCommand('branch prev --no-interactive');
            chai_1.expect(scene.repo.currentBranchName()).to.equal('main');
        });
        it('Can rollback changes on a failed commit hook', () => {
            // Aggressive AF commit hook from your angry coworker
            scene.repo.createPrecommitHook('exit 1');
            scene.repo.createChange('2');
            chai_1.expect(() => {
                scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            }).to.throw(Error);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('main');
        });
        it('Can create a branch without providing a name', () => {
            scene.repo.createChange('2');
            scene.repo.execCliCommand(`branch create -m "feat(test): info" -q`);
            chai_1.expect(scene.repo.currentBranchName().includes('feat_test_info')).to.be
                .true;
        });
        it('Can create a branch with add all option', () => {
            scene.repo.createChange('23', 'test', true);
            chai_1.expect(git_status_utils_1.unstagedChanges()).to.be.true;
            scene.repo.execCliCommand(`branch create test-branch -m "add all" -a -q`);
            chai_1.expect(git_status_utils_1.unstagedChanges()).to.be.false;
        });
        it('Cant create a branch off an ignored branch', () => {
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.execCliCommand('repo init --trunk main --ignore-branches a');
            chai_1.expect(() => scene.repo.execCliCommand(`branch create test -q`)).to.throw(Error);
        });
        it('Create a branch clears any old, stale metadata', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('2');
            scene.repo.execCliCommand("branch create a -m 'a'");
            const branch = branch_1.Branch.branchWithName('a');
            branch.upsertPRInfo({
                number: 1,
                base: 'main',
            });
            chai_1.expect(branch_1.Branch.branchWithName('a').getPRInfo() !== undefined).to.be.true;
            scene.repo.checkoutBranch('main');
            scene.repo.deleteBranch('a');
            scene.repo.createChange('2');
            scene.repo.execCliCommand("branch create a -m 'a'");
            // Upon recreating the branch, the old PR info should be gone.
            chai_1.expect(branch_1.Branch.branchWithName('a').getPRInfo() === undefined).to.be.true;
        }));
    });
}
//# sourceMappingURL=branch_create.test.js.map