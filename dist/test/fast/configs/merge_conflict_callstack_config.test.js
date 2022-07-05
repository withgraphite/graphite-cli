"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`merge conflict callstack config test`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Can silently clean up invalid config', () => {
            // should work fine.
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
            // write an invalid config
            fs_extra_1.default.writeFileSync(`${scene.repo.dir}/.git/.graphite_merge_conflict`, 'abc');
            // Should still not error
            (0, chai_1.expect)(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=merge_conflict_callstack_config.test.js.map