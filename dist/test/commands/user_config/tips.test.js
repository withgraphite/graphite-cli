"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): user tips`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Sanity check - can enable tips', () => {
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`user`, `tips`, `--enable`])).to.not.throw(Error);
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `tips`])).to.equal('tips enabled');
        });
        it('Sanity check - can disable tips', () => {
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`user`, `tips`, `--disable`])).to.not.throw(Error);
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `tips`])).to.equal('tips disabled');
        });
    });
}
//# sourceMappingURL=tips.test.js.map