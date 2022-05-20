"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../../lib/scenes/all_scenes");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe(`(${scene}): repo trunk`, function () {
        configure_test_1.configureTest(this, scene);
        it('Can infer main trunk', () => {
            scene.repo.createChange('2', 'a');
            scene.repo.execCliCommand("branch create 'a' -m '2' -q");
            chai_1.expect(scene.repo.execCliCommandAndGetOutput('repo trunk').includes('(main)')).to.be.true;
        });
        it('Throws an error if trunk has a sibling commit', () => {
            chai_1.expect(() => scene.repo.execCliCommand('ls')).to.not.throw(Error);
            scene.repo.createAndCheckoutBranch('sibling');
            chai_1.expect(() => scene.repo.execCliCommand('ls')).to.throw(Error);
        });
        it('Can get trunk if there is an ignored branch pointing to the same commit', () => {
            scene.repo.createAndCheckoutBranch('ignore-me');
            scene.repo.checkoutBranch('main');
            chai_1.expect(() => scene.repo.execCliCommand('ls')).to.throw(Error);
            scene.repo.execCliCommand('repo ignored-branches --add ignore-me');
            chai_1.expect(() => scene.repo.execCliCommand('ls')).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput('repo trunk').includes('(main)')).to.be.true;
        });
    });
}
//# sourceMappingURL=trunk.test.js.map