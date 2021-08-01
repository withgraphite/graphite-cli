import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): repo-config trunk`, function () {
    configureTest(this, scene);

    it("Can infer main trunk", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");
      expect(
        scene.repo.execCliCommandAndGetOutput("repo trunk").includes("(main)")
      ).to.be.true;
    });
  });
}
