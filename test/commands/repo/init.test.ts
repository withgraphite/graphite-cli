import { expect } from "chai";
import fs from "fs-extra";
import { TrailingProdScene } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of [new TrailingProdScene()]) {
  describe(`(${scene}): repo init`, function () {
    configureTest(this, scene);

    it("Can run init in a fresh repo", () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      expect(fs.existsSync(repoConfigPath)).to.be.false;
      scene.repo.execCliCommand(
        "repo init --trunk main --ignore-branches prod"
      );
      const savedConfig = JSON.parse(
        fs.readFileSync(repoConfigPath).toString()
      );
      expect(savedConfig["trunk"]).to.eq("main");
      expect(savedConfig["ignoreBranches"][0]).to.eq("prod");
    });

    it("Cannot set an invalid trunk", () => {
      expect(() =>
        scene.repo.execCliCommand("repo init --trunk random")
      ).to.throw(Error);
    });
  });
}
