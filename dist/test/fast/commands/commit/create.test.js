"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): commit create`, function () {
        utils_1.configureTest(this, scene);
        it('Can create a commit', () => {
            scene.repo.createChange('2');
            scene.repo.execCliCommand(`commit create -m "2" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('main');
            utils_1.expectCommits(scene.repo, '2, 1');
        });
        it('Can create a commit with a multi-word commit message', () => {
            scene.repo.createChange('2');
            scene.repo.execCliCommand(`commit create -m "a b c" -q`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('main');
            utils_1.expectCommits(scene.repo, 'a b c');
        });
        it('Fails to create a commit if there are no staged changes', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`commit create -m "a" -q`)).to.throw(Error);
        });
        it('Automatically fixes upwards', () => {
            scene.repo.createChange('2', '2');
            scene.repo.execCliCommand(`branch create a -m "2" -q`);
            scene.repo.createChange('3', '3');
            scene.repo.execCliCommand(`branch create b -m "3" -q`);
            scene.repo.checkoutBranch('a');
            scene.repo.createChange('2.5', '2.5');
            scene.repo.execCliCommand(`commit create -m "2.5" -q`);
            scene.repo.checkoutBranch('b');
            utils_1.expectCommits(scene.repo, '3, 2.5, 2, 1');
        });
    });
}
//# sourceMappingURL=create.test.js.map