import { cache } from "../../../src/lib/config";
import { AbstractScene } from "../scenes/abstract_scene";

export function configureTest(suite: Mocha.Suite, scene: AbstractScene): void {
  suite.timeout(600000);
  suite.beforeEach(() => {
    cache.clearAll();
    scene.setup();
  });
  suite.afterEach(() => {
    scene.cleanup();
  });
}
