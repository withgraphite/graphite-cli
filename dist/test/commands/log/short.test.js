"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const trailing_prod_scene_1 = require("../../lib/scenes/trailing_prod_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new trailing_prod_scene_1.TrailingProdScene()]) {
    describe(`(${scene}): log short`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can log short', () => {
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
        it("Can print stacks if a branch's parent has been deleted", () => {
            // This is mostly an effort to recreate a messed-up repo state that created a bug for a user.
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create a -m "a"`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create b -m "b"`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChangeAndCommit('2', '2');
            scene.repo.checkoutBranch('a');
            (0, child_process_1.execSync)(`git -C ${scene.repo.dir} rebase prod`);
            // b's now has no git-parents, but it's meta points to "a" which still exists but is not off main.
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
        it('Doesnt error when creating an empty branch because of empty commits', () => {
            scene.repo.execCliCommand(`branch create a -m "a"`);
            scene.repo.checkoutBranch('main');
            (0, chai_1.expect)(() => scene.repo.execCliCommand('log short')).to.not.throw(Error);
        });
        it('Works if branch and file have same name', () => {
            const textFileName = 'test.txt';
            scene.repo.execCliCommand(`branch create ${textFileName} -m "a"`);
            // Creates a commit with contents "a" in file "test.txt"
            scene.repo.createChangeAndCommit('a');
            (0, chai_1.expect)(fs_extra_1.default.existsSync(textFileName)).to.be.true;
            scene.repo.checkoutBranch(textFileName);
            // gt log should work - using "test.txt" as a revision rather than a path
            (0, chai_1.expect)(() => scene.repo.execCliCommand('log')).to.not.throw(Error);
            (0, chai_1.expect)(() => scene.repo.execCliCommand('log short')).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=short.test.js.map