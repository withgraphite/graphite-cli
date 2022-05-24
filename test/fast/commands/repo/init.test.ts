import { expect } from 'chai';
import fs from 'fs-extra';
import { TrailingProdScene } from '../../../lib/scenes/trailing_prod_scene';
import { configureTest } from '../../../lib/utils/configure_test';

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): repo init`, function () {
    configureTest(this, scene);

    it('Can run repo init', () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      fs.removeSync(repoConfigPath);
      scene.repo.execCliCommand('repo init --trunk main');
      const savedConfig = JSON.parse(
        fs.readFileSync(repoConfigPath).toString()
      );
      expect(savedConfig['trunk']).to.eq('main');
    });

    it('Cannot set an invalid trunk', () => {
      expect(() =>
        scene.repo.execCliCommand('repo init --trunk random')
      ).to.throw(Error);
    });
  });
}
