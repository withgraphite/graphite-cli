"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const wrapper_classes_1 = require("../../../../src/wrapper-classes");
const branch_1 = __importDefault(require("../../../../src/wrapper-classes/branch"));
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
const expect_branches_1 = require("../../../lib/utils/expect_branches");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch delete`, function () {
        utils_1.configureTest(this, scene);
        it("Can run branch delete", () => {
            const branchName = "a";
            scene.repo.createChangeAndCommit("2", "2");
            scene.repo.execCliCommand(`branch create "${branchName}" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal(branchName);
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommand(`branch delete "${branchName}" -D -q`);
            expect_branches_1.expectBranches(scene.repo, "main");
            chai_1.expect(branch_1.default.exists(branchName)).to.be.false;
            chai_1.expect(wrapper_classes_1.MetadataRef.allMetadataRefs().find((ref) => ref._branchName === branchName)).to.be.undefined;
        });
        it("Can run branch delete on a branch not created/tracked by Graphite", () => {
            const branchName = "a";
            scene.repo.createAndCheckoutBranch(branchName);
            scene.repo.createChangeAndCommit("2", "2");
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommandAndGetOutput(`branch delete "${branchName}" -D -q`);
            expect_branches_1.expectBranches(scene.repo, "main");
            chai_1.expect(branch_1.default.exists(branchName)).to.be.false;
            chai_1.expect(wrapper_classes_1.MetadataRef.allMetadataRefs().find((ref) => ref._branchName === branchName)).to.be.undefined;
        });
    });
}
//# sourceMappingURL=branch_delete.test.js.map