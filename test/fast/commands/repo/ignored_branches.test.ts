import { expect } from 'chai';
import fs from 'fs-extra';
import { TrailingProdScene } from '../../../lib/scenes';
import { configureTest } from '../../../lib/utils';

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): repo ignored-branches`, function () {
    configureTest(this, scene);

    it('Can run add ignored-branches', () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      fs.removeSync(repoConfigPath);
      const branchToAdd = 'prod';
      scene.repo.execCliCommand(`repo ignored-branches --add ${branchToAdd}`);
      const savedConfig = JSON.parse(
        fs.readFileSync(repoConfigPath).toString()
      );
      expect(savedConfig['ignoreBranches'][0]).to.eq(branchToAdd);
    });
  });
}
