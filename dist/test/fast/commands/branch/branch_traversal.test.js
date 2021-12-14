"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
function setupStack(scene) {
    scene.repo.createChange('a', 'a');
    scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
    scene.repo.createChange('b', 'b');
    scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
    scene.repo.createChange('c', 'b');
    scene.repo.execCliCommand(`branch create "c" -m "c" -q`);
}
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): next and prev`, function () {
        (0, utils_1.configureTest)(this, scene);
        it('Can move to next branch', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.execCliCommand(`branch next --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
        it('Can move to prev branch', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
        it('Branch prev goes up to trunk', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('a');
            scene.repo.execCliCommand(`branch prev --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('main');
        });
        it('Can move to next branch with numSteps = 2', () => {
            setupStack(scene);
            scene.repo.checkoutBranch('a');
            scene.repo.execCliCommand(`branch next 2 --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('c');
        });
        it('Can move to prev branch with numSteps = 2', () => {
            setupStack(scene);
            scene.repo.execCliCommand(`branch prev 2 --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
        it('Can move to top of the stack', () => {
            setupStack(scene);
            scene.repo.checkoutBranch('a');
            scene.repo.execCliCommand(`branch top --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('c');
        });
        it('Can move to bottom of the stack', () => {
            setupStack(scene);
            scene.repo.execCliCommand(`branch bottom --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
        it('branch down moves to prev', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange('b', 'b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.execCliCommand(`branch down --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
        it('branch up moves to next', () => {
            scene.repo.createChange('a', 'a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.execCliCommand(`branch up --no-interactive`);
            (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('a');
        });
    });
}
//# sourceMappingURL=branch_traversal.test.js.map