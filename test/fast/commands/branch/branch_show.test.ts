import { expect } from 'chai';
import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of allScenes) {
  describe(`(${scene}): Branch show`, function () {
    configureTest(this, scene);

    it('Shows all branch children', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "branch_a" -m "a" -q`);

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "branch_b" -m "b" -q`);

      scene.repo.checkoutBranch('branch_a');
      const aOutput = scene.repo.execCliCommandAndGetOutput(`branch show`);
      expect(aOutput).to.contain('branch_b');
    });
  });
}
