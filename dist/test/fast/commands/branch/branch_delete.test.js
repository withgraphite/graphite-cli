"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const branch_exists_1 = require("../../../../src/lib/utils/branch_exists");
const metadata_ref_1 = require("../../../../src/wrapper-classes/metadata_ref");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
const expect_branches_1 = require("../../../lib/utils/expect_branches");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): branch delete`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can run branch delete', () => {
            const branchName = 'a';
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.execCliCommand(`branch create "${branchName}" -m "${branchName}" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal(branchName);
            scene.repo.checkoutBranch('main');
            scene.repo.execCliCommand(`branch delete "${branchName}" -f -q`);
            expect_branches_1.expectBranches(scene.repo, 'main');
            chai_1.expect(branch_exists_1.branchExists(branchName)).to.be.false;
            chai_1.expect(metadata_ref_1.MetadataRef.allMetadataRefs().find((ref) => ref._branchName === branchName)).to.be.undefined;
        });
        it('Can run branch delete on a branch not created/tracked by Graphite', () => {
            const branchName = 'a';
            scene.repo.createAndCheckoutBranch(branchName);
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.checkoutBranch('main');
            scene.repo.execCliCommandAndGetOutput(`bdl "${branchName}" -f -q`);
            expect_branches_1.expectBranches(scene.repo, 'main');
            chai_1.expect(branch_exists_1.branchExists(branchName)).to.be.false;
            chai_1.expect(metadata_ref_1.MetadataRef.allMetadataRefs().find((ref) => ref._branchName === branchName)).to.be.undefined;
        });
    });
}
//# sourceMappingURL=branch_delete.test.js.map