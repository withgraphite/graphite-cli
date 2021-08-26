import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): repo trunk`, function () {
    configureTest(this, scene);

    it("Can infer main trunk", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -q");
      expect(
        scene.repo.execCliCommandAndGetOutput("repo trunk").includes("(main)")
      ).to.be.true;
    });

    it("Does not throw an error if trunk has a sibling commit WITH meta", () => {
      scene.repo.execCliCommand("branch create 'sibling' -q");
      expect(() => scene.repo.execCliCommand("ls")).to.not.throw(Error);
    });
  });
}
