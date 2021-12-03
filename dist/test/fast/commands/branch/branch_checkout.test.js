"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch create`, function () {
        utils_1.configureTest(this, scene);
        it("Can checkout a branch", () => {
            scene.repo.createChange("a", "a");
            scene.repo.execCliCommand(`branch create a -m "a" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.execCliCommand(`branch checkout a`);
            chai_1.expect(scene.repo.currentBranchName()).to.eq("a");
        });
    });
}
//# sourceMappingURL=branch_checkout.test.js.map