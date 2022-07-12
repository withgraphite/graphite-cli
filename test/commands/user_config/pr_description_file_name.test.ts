import { expect } from 'chai';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user PR description file name`, function () {
    configureTest(this, scene);

    it('Sanity check - can check PR description file name', () => {
      expect(() => scene.repo.execCliCommand(`user pr-description-file-name`)).to.not.throw(
        Error
      );
    });

    it('Sanity check - can set PR description file name', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user pr-description-file-name --set COMMIT_EDITMSG`)
      ).to.equal('PR description file name set to COMMIT_EDITMSG');
      expect(scene.repo.execCliCommandAndGetOutput(`user pr-description-file-name`)).to.equal(
        'COMMIT_EDITMSG'
      );
    });

    it('Sanity check - can unset PR description file name', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user pr-description-file-name --unset`)
      ).to.equal(
        'PR description file name preference erased. Defaulting to a random file name.'
      );
    });
  });
}
