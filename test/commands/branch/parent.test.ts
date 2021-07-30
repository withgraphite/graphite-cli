import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch parent`, function () {
    configureTest(this, scene);

    it("Can list parent in a stack", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -s`);
      expect(scene.repo.execCliCommandAndGetOutput(`branch parent`)).to.eq(
        "main"
      );
    });
  });
}
