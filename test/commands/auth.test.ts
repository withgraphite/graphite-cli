import { expect } from "chai";
import { userConfig } from "../../src/lib/config";
import { BasicScene } from "../scenes";
import { configureTest } from "../utils";

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): auth`, function () {
    configureTest(this, scene);

    /**
     * If users run this test locally, we don't want it to mangle their auth
     * token. As a result, before we run our tests, we save their auth token
     * and after finishing our tests, we reset their auth token.
     */
    let localAuthToken: string | undefined;
    before(function () {
      localAuthToken = userConfig.getAuthToken();
    });

    it("Sanity check - can read previously written auth token", () => {
      const authToken = "SUPER_SECRET_AUTH_TOKEN";
      expect(() =>
        scene.repo.execCliCommand(`auth -t ${authToken}`)
      ).to.not.throw(Error);
      expect(scene.repo.execCliCommandAndGetOutput(`auth`)).to.equal(authToken);
    });

    it("Overwrites any previously stored auth token", () => {
      const authTokenOld = "SUPER_SECRET_AUTH_TOKEN_OLD";
      const authTokenNew = "SUPER_SECRET_AUTH_TOKEN_NEW";
      expect(() =>
        scene.repo.execCliCommand(`auth -t ${authTokenOld}`)
      ).to.not.throw(Error);
      expect(() =>
        scene.repo.execCliCommand(`auth -t ${authTokenNew}`)
      ).to.not.throw(Error);
      expect(scene.repo.execCliCommandAndGetOutput(`auth`)).to.equal(
        authTokenNew
      );
    });

    after(function () {
      if (localAuthToken !== undefined) {
        userConfig.setAuthToken(localAuthToken);
      }
    });
  });
}
