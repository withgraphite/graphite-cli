"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): auth`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Sanity check - can read previously written auth token', () => {
            const authToken = 'SUPER_SECRET_AUTH_TOKEN';
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`auth`, `-t`, `${authToken}`])).to.not.throw(Error);
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`auth`])).to.equal(authToken);
        });
        it('Overwrites any previously stored auth token', () => {
            const authTokenOld = 'SUPER_SECRET_AUTH_TOKEN_OLD';
            const authTokenNew = 'SUPER_SECRET_AUTH_TOKEN_NEW';
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`auth`, `-t`, `${authTokenOld}`])).to.not.throw(Error);
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`auth`, `-t`, `${authTokenNew}`])).to.not.throw(Error);
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`auth`])).to.equal(authTokenNew);
        });
    });
}
//# sourceMappingURL=auth.test.js.map