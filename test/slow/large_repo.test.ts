import { PublicRepoScene } from "../lib/scenes";
import { configureTest } from "../lib/utils";

for (const scene of [
  new PublicRepoScene({
    repoUrl: "https://github.com/SmartThingsCommunity/SmartThingsPublic.git",
    name: "SmartThingsPublic",
    timeout: 20000,
  }),
  new PublicRepoScene({
    repoUrl: "https://github.com/dagster-io/dagster.git",
    name: "Dagster",
    timeout: 10000,
  }),
]) {
  describe(`(${scene}): Run simple timed commands`, function () {
    configureTest(this, scene);

    it("Can run stacks quickly", () => {
      scene.repo.execCliCommand(`log short`);
    }).timeout(scene.timeout);

    it("Can run log quickly", () => {
      scene.repo.execCliCommand(`log`);
    }).timeout(scene.timeout);
  });
}
