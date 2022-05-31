import { expect } from 'chai';
import { BasicScene } from '../../../lib/scenes/basic_scene';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): user editor`, function () {
    configureTest(this, scene);

    /**
     * If users run this test locally, we don't want it to mangle their editor settings
     * As a result, before we run our tests, we save their editor preference
     * and after finishing our tests, we reset their editor preference.
     */
    let gitEditorPref: string | undefined;
    let editorPref: string | undefined;
    before(function () {
      gitEditorPref = process.env.GIT_EDITOR;
      editorPref = scene.context.userConfig.data.editor;
      process.env.GIT_EDITOR = 'helloworld';
    });

    it('Sanity check - can check editor', () => {
      expect(() => scene.repo.execCliCommand(`user editor`)).to.not.throw(
        Error
      );
    });

    it('Sanity check - can set editor', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user editor --set vim`)
      ).to.equal('Editor set to vim');
      expect(scene.repo.execCliCommandAndGetOutput(`user editor`)).to.equal(
        'vim'
      );
    });

    it('Sanity check - can unset editor', () => {
      expect(
        scene.repo.execCliCommandAndGetOutput(`user editor --unset`)
      ).to.equal(
        'Editor preference erased. Defaulting to your git editor (currently helloworld)'
      );
    });

    after(function () {
      scene.context.userConfig.update((data) => (data.editor = editorPref));
      process.env.GIT_EDITOR = gitEditorPref;
    });
  });
}
