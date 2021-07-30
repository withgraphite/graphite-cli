import { expect } from "chai";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch children`, function () {
    configureTest(this, scene);

    it("Can list children in a stack", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -s`);
      scene.repo.checkoutBranch("main");
      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -s`);
      scene.repo.checkoutBranch("main");
      expect(scene.repo.execCliCommandAndGetOutput(`branch children`)).to.eq(
        `a\nb`
      );
    });

    it("Can list no children", () => {
      expect(scene.repo.execCliCommandAndGetOutput(`branch children -s`)).to.eq(
        ""
      );
    });
  });
}
