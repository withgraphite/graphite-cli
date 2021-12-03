"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): two letter shortcuts`, function () {
        utils_1.configureTest(this, scene);
        it("Can run 'bn' shortcut command", () => {
            scene.repo.execCliCommand(`branch create "a" -q`);
            scene.repo.checkoutBranch("main");
            chai_1.expect(() => scene.repo.execCliCommand("bn --no-interactive")).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=two_letter_shortcuts.test.js.map