"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../../lib/scenes/basic_scene");
const configure_test_1 = require("../../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): user tips`, function () {
        configure_test_1.configureTest(this, scene);
        /**
         * If users run this test locally, we don't want it to mangle their tips settings
         * As a result, before we run our tests, we save their tips preference
         * and after finishing our tests, we reset their tips preference.
         *
         * Note: the command within the test runs in a subprocess, so while it does not modify the in-memory state
         * ie the value stored in userConfig.tipsEnabled(), it DOES modify the on-disk user config file, hence the
         * preference restore is necessary.
         */
        let tipsPref;
        before(function () {
            tipsPref = scene.context.userConfig.data.tips;
        });
        it('Sanity check - can enable tips', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`user tips --enable`)).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal('tips enabled');
        });
        it('Sanity check - can disable tips', () => {
            chai_1.expect(() => scene.repo.execCliCommand(`user tips --disable`)).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`user tips`)).to.equal('tips disabled');
        });
        after(function () {
            if (tipsPref !== undefined) {
                scene.context.userConfig.update((data) => (data.tips = tipsPref));
            }
        });
    });
}
//# sourceMappingURL=tips.test.js.map