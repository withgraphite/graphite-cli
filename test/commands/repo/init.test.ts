import { expect } from "chai";
import fs from "fs-extra";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): repo init`, function () {
    configureTest(this, scene);

    it("Can run init in a fresh repo", () => {
      const repoConfigPath = `${scene.repo.dir}/.git/.graphite_repo_config`;
      expect(fs.existsSync(repoConfigPath)).to.be.false;
      scene.repo.execCliCommand("repo init --trunk main");
      expect(fs.readFileSync(repoConfigPath).toString().includes("main")).to.be
        .true;
    });

    it("Cannot set an invalid trunk", () => {
      expect(() =>
        scene.repo.execCliCommand("repo init --trunk random")
      ).to.throw(Error);
    });
  });
}
