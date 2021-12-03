"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of scenes_1.allScenes) {
    describe(`(${scene}): branch parent`, function () {
        utils_1.configureTest(this, scene);
        it("Can list parent in a stack", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`branch parent`)).to.eq("main");
        });
    });
}
//# sourceMappingURL=parent.test.js.map