import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): auth`, function () {
    configureTest(this, scene);
    it('Sanity check - can read previously written auth token', () => {
      const authToken = 'SUPER_SECRET_AUTH_TOKEN';
      expect(() =>
        scene.repo.runCliCommand([`auth`, `-t`, `${authToken}`])
      ).to.not.throw(Error);
      expect(scene.repo.runCliCommandAndGetOutput([`auth`])).to.equal(
        authToken
      );
    });

    it('Overwrites any previously stored auth token', () => {
      const authTokenOld = 'SUPER_SECRET_AUTH_TOKEN_OLD';
      const authTokenNew = 'SUPER_SECRET_AUTH_TOKEN_NEW';
      expect(() =>
        scene.repo.runCliCommand([`auth`, `-t`, `${authTokenOld}`])
      ).to.not.throw(Error);
      expect(() =>
        scene.repo.runCliCommand([`auth`, `-t`, `${authTokenNew}`])
      ).to.not.throw(Error);
      expect(scene.repo.runCliCommandAndGetOutput([`auth`])).to.equal(
        authTokenNew
      );
    });
  });
}
