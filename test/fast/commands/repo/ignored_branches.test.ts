import { expect } from 'chai';
import fs from 'fs-extra';
import { TrailingProdScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): repo ignored-branches`, function () {
    configureTest(this, scene);
    const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;

    before(function () {
      fs.removeSync(repoConfigPath);
      scene.repo.execCliCommand(
        'repo init --trunk main --ignore-branches prod'
      );
    });

    it('Can run ignored-branches to list ignored branches', () => {
      expect(
        scene.repo
          .execCliCommandAndGetOutput('repo ignored-branches')
          .toString()
          .trim()
      ).to.contain('prod');
    });
  });
}
