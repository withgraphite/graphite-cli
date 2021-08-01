import { expect } from "chai";
import { allScenes } from "../scenes";
import { configureTest } from "../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stacks`, function () {
    configureTest(this, scene);

    it("Can print stacks", () => {
      expect(() => scene.repo.execCliCommand(`stacks`)).to.not.throw(Error);
    });
  });
}
