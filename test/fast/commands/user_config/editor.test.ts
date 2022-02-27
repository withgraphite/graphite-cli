import { expect } from 'chai';
import { DEFAULT_GRAPHITE_EDITOR } from '../../../../src/commands/user-commands/editor';
import { userConfig } from '../../../../src/lib/config/user_config';
import { logInfo } from '../../../../src/lib/utils';
import { BasicScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user editor`, function () {
    configureTest(this, scene);

    /**
     * If users run this test locally, we don't want it to mangle their editor settings
     * As a result, before we run our tests, we save their editor preference
     * and after finishing our tests, we reset their editor preference.
     */
    let editorPref: string | undefined;
    before(function () {
      editorPref = userConfig.data.editor;
      logInfo(`Existing user pref: ${editorPref}`);
    });

    it('Sanity check - can check editor', () => {
      scene.repo.execCliCommand(`user editor --unset`);
      expect(() => scene.repo.execCliCommand(`user editor`)).to.not.throw(
        Error
      );
      expect(scene.repo.execCliCommandAndGetOutput(`user editor`)).to.equal(
        'Current editor preference is set to : nano'
      );
    });

    it('Sanity check - can set editor', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user editor --set vim`)
      ).to.equal('Editor preference set to: vim');
      expect(scene.repo.execCliCommandAndGetOutput(`user editor`)).to.equal(
        'Current editor preference is set to : vim'
      );
    });

    it('Sanity check - can unset editor', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user editor --unset`)
      ).to.equal(
        `Editor preference erased. Defaulting to Graphite default: ${DEFAULT_GRAPHITE_EDITOR}`
      );
      expect(scene.repo.execCliCommandAndGetOutput(`user editor`)).to.equal(
        `Current editor preference is set to : ${DEFAULT_GRAPHITE_EDITOR}`
      );
    });

    after(function () {
      if (editorPref !== undefined) {
        userConfig.update((data) => (data.editor = editorPref));
        logInfo(`Reset user pref: ${editorPref}`);
      }
    });
  });
}
