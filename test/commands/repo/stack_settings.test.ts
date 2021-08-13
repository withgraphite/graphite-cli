import { expect } from "chai";
import fs from "fs-extra";
import path from "path";
import { repoConfig } from "../../../src/lib/config";
import { BasicScene } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): log settings tests`, function () {
    configureTest(this, scene);

    it("Can read settings written using the CLI commands", () => {
      scene.repo.execCliCommand("repo max-stacks-behind-trunk -s 1");
      scene.repo.execCliCommand("repo max-days-behind-trunk -s 2");

      expect(
        scene.repo
          .execCliCommandAndGetOutput("repo max-stacks-behind-trunk")
          .includes("1")
      ).to.be.true;

      expect(
        scene.repo
          .execCliCommandAndGetOutput("repo max-days-behind-trunk")
          .includes("2")
      ).to.be.true;
    });

    it("Can read log settings written in the old log settings location", () => {
      const config = {
        trunk: "main",
        ignoreBranches: [],
        logSettings: {
          maxStacksShownBehindTrunk: 5,
          maxDaysShownBehindTrunk: 10,
        },
      };
      writeRepoConfig(config);

      expect(
        scene.repo
          .execCliCommandAndGetOutput("repo max-stacks-behind-trunk")
          .includes("5")
      ).to.be.true;

      expect(
        scene.repo
          .execCliCommandAndGetOutput("repo max-days-behind-trunk")
          .includes("10")
      ).to.be.true;
    });
  });

  function writeRepoConfig(newConfig: {}): void {
    fs.writeFileSync(
      path.join(scene.dir, repoConfig.path()),
      JSON.stringify(newConfig, null, 2)
    );
  }
}
