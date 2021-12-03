"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config_1 = require("../../../../src/lib/config");
const scenes_1 = require("../../../lib/scenes");
const utils_1 = require("../../../lib/utils");
for (const scene of [new scenes_1.BasicScene()]) {
    describe(`(${scene}): auth`, function () {
        utils_1.configureTest(this, scene);
        /**
         * If users run this test locally, we don't want it to mangle their auth
         * token. As a result, before we run our tests, we save their auth token
         * and after finishing our tests, we reset their auth token.
         */
        let localAuthToken;
        before(function () {
            localAuthToken = config_1.userConfig.getAuthToken();
        });
        it("Sanity check - can read previously written auth token", () => {
            const authToken = "SUPER_SECRET_AUTH_TOKEN";
            chai_1.expect(() => scene.repo.execCliCommand(`auth -t ${authToken}`)).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`auth`)).to.equal(authToken);
        });
        it("Overwrites any previously stored auth token", () => {
            const authTokenOld = "SUPER_SECRET_AUTH_TOKEN_OLD";
            const authTokenNew = "SUPER_SECRET_AUTH_TOKEN_NEW";
            chai_1.expect(() => scene.repo.execCliCommand(`auth -t ${authTokenOld}`)).to.not.throw(Error);
            chai_1.expect(() => scene.repo.execCliCommand(`auth -t ${authTokenNew}`)).to.not.throw(Error);
            chai_1.expect(scene.repo.execCliCommandAndGetOutput(`auth`)).to.equal(authTokenNew);
        });
        after(function () {
            if (localAuthToken !== undefined) {
                config_1.userConfig.setAuthToken(localAuthToken);
            }
        });
    });
}
//# sourceMappingURL=auth.test.js.map