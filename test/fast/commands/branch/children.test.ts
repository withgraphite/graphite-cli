import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): branch children`, function () {
    configureTest(this, scene);

    it('Can list children in a stack', () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.checkoutBranch('main');
      console.log('main1');
      scene.repo.createChange('b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
      scene.repo.checkoutBranch('main');
      console.log('main2');
      expect(scene.repo.execCliCommandAndGetOutput(`branch children`)).to.eq(
        `a\nb`
      );
    });

    it('Can list no children', () => {
      expect(scene.repo.execCliCommandAndGetOutput(`branch children`)).to.eq(
        '(main) has no child branches (branches stacked on top of it).'
      );
    });
  });
}
