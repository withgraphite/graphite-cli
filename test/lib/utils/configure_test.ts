import { AbstractScene } from "../scenes/abstract_scene";

export function configureTest(suite: Mocha.Suite, scene: AbstractScene): void {
  suite.timeout(60000);
  suite.beforeEach(() => {
    scene.setup();
  });
  suite.afterEach(() => {
    scene.cleanup();
  });
}
