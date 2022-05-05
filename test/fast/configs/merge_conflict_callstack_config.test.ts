import { expect } from 'chai';
import fs from 'fs-extra';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`merge conflict callstack config test`, function () {
    configureTest(this, scene);

    it('Can silently clean up invalid config', () => {
      // should work fine.
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
      // write an invalid config
      fs.writeFileSync(
        `${scene.repo.dir}/.git/.graphite_merge_conflict`,
        'abc'
      );
      // Should still not error
      expect(() => scene.repo.execCliCommand(`log short`)).to.not.throw(Error);
    });
  });
}
