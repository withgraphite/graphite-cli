"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch children`, function () {
        utils_1.configureTest(this, scene);
        it('Can list children in a stack', () => {
            scene.repo.createChange('a');
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            scene.repo.createChange('b');
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch('main');
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`branch children`)).to.eq(`a\nb`);
        });
        it('Can list no children', () => {
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`branch children`)).to.eq('(main) has no child branches (branches stacked on top of it).');
        });
    });
}
//# sourceMappingURL=children.test.js.map