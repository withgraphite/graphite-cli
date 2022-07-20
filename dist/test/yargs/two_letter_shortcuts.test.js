"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../lib/scenes/basic_scene");
const configure_test_1 = require("../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): two letter shortcuts`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it("Can run 'bu' shortcut command", () => {
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch('main');
            (0, chai_1.expect)(() => scene.repo.execCliCommand('bu --no-interactive')).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=two_letter_shortcuts.test.js.map