"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): user editor`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Sanity check - can check editor', () => {
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`user`, `editor`])).to.not.throw(Error);
        });
        it('Sanity check - can set editor', () => {
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `editor`, `--set`, `vim`])).to.equal('Editor set to vim');
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `editor`])).to.equal('vim');
        });
        it('Sanity check - can unset editor', () => {
            process.env.GIT_EDITOR = 'vi';
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `editor`, `--unset`])).to.equal('Editor preference erased. Defaulting to your git editor (currently vi)');
        });
    });
}
//# sourceMappingURL=editor.test.js.map