import { BasicScene, LargeScene } from "../lib/scenes";
import { configureTest } from "../lib/utils";

for (const scene of [new BasicScene(), new LargeScene()]) {
  describe(`(${scene}): Run simple timed commands`, function () {
    configureTest(this, scene);

    it("Can run stacks quickly", () => {
      scene.repo.execCliCommand(`log short`);
    }).timeout(10000);

    it("Can run log quickly", () => {
      scene.repo.execCliCommand(`log`);
    }).timeout(10000);
  });
}
