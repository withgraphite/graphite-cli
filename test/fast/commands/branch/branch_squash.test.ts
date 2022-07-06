import { allScenes } from '../../../lib/scenes/all_scenes';
import { configureTest } from '../../../lib/utils/configure_test';
import { expectCommits } from '../../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): fold`, function () {
    configureTest(this, scene);

    it('Can squash two commits into one and restack a child', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      scene.repo.createChange('a2', 'a2');
      scene.repo.execCliCommand(`commit create -m "a2" -q`);

      scene.repo.createChange('b', 'b');
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      expectCommits(scene.repo, 'b, a2, a, 1');

      scene.repo.execCliCommand(`branch down`);
      scene.repo.execCliCommand(`branch squash -n`);
      scene.repo.execCliCommand(`branch up`);

      expectCommits(scene.repo, 'b, a, 1');
    });
  });
}
