import { AbstractScene } from "./abstract_scene";

export class BasicScene extends AbstractScene {
  public toString(): string {
    return "BasicScene";
  }
  public setup(): void {
    super.setup();
    this.repo.createChangeAndCommit("1", "1");
  }
}
