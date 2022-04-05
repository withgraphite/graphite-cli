"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`merge conflict callstack config test`, function () {
        utils_1.configureTest(this, scene);
        it('Can silently clean up invalid config', () => {
            // should work fine.
            chai_1.expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
            // write an invalid config
            fs_extra_1.default.writeFileSync(`${scene.repo.dir}/.git/.graphite_merge_conflict`, 'abc');
            // Should still not error
            chai_1.expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
        });
    });
}
//# sourceMappingURL=merge_conflict_callstack_config.test.js.map