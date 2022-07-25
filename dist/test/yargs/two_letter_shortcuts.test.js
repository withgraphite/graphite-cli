"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../lib/scenes/basic_scene");
const configure_test_1 = require("../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): two letter shortcuts`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it("Can run 'bd' shortcut command", () => {
            scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
            scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);
            (0, chai_1.expect)(() => scene.repo.runCliCommand(['bd'])).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=two_letter_shortcuts.test.js.map