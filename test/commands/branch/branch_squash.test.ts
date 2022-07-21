import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): fold`, function () {
    configureTest(this, scene);

    it('Can squash two commits into one and restack a child', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);
      scene.repo.createChange('a2', 'a2');
      scene.repo.runCliCommand([`commit`, `create`, `-m`, `a2`]);

      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      expectCommits(scene.repo, 'b, a2, a, 1');

      scene.repo.runCliCommand([`branch`, `down`]);
      scene.repo.runCliCommand([`branch`, `squash`, `-n`]);
      scene.repo.runCliCommand([`branch`, `up`]);

      expectCommits(scene.repo, 'b, a, 1');
    });
  });
}
