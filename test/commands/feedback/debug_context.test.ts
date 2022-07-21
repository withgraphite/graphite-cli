import { expect } from 'chai';
import fs from 'fs-extra';
import { GitRepo } from '../../../src/lib/utils/git_repo';
import { TrailingProdScene } from '../../lib/scenes/trailing_prod_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): feedback debug-context`, function () {
    configureTest(this, scene);

    it('Can create debug-context', () => {
      expect(() =>
        scene.repo.runCliCommand([`feedback`, `debug-context`])
      ).to.not.throw(Error);
    });

    it('Can recreate a tmp repo based on debug context', () => {
      scene.repo.createChange('a', 'a');
      scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, `a`]);

      scene.repo.createChange('b', 'b');
      scene.repo.runCliCommand([`branch`, `create`, `b`, `-m`, `b`]);

      const context = scene.repo.runCliCommandAndGetOutput([
        `feedback`,
        `debug-context`,
      ]);

      const outputLines = scene.repo
        .runCliCommandAndGetOutput([
          `feedback`,
          `debug-context`,
          `--recreate`,
          context,
        ])
        .toString()
        .trim()
        .split('\n');

      const tmpDir = outputLines[outputLines.length - 1];

      const newRepo = new GitRepo(tmpDir);
      newRepo.checkoutBranch('b');
      expect(newRepo.currentBranchName()).to.eq('b');

      newRepo.runCliCommand([`bd`]);
      expect(newRepo.currentBranchName()).to.eq('a');

      fs.emptyDirSync(tmpDir);
      fs.removeSync(tmpDir);
    });
  });
}
