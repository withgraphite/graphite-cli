"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): log short`, function () {
        utils_1.configureTest(this, scene);
        it("Can log short", () => {
            chai_1.expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
        it("Can print stacks if a branch's parent has been deleted", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.createChangeAndCommit("a", "a");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("b", "b");
            scene.repo.execCliCommand(`branch parent --set a`);
            scene.repo.deleteBranch("a");
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("2", "2");
            chai_1.expect(() => scene.repo.execCliCommandAndGetOutput(`log short`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=stacks.test.js.map