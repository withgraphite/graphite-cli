import { execSync } from "child_process";
import { AbstractScene } from "./abstract_scene";

export class TrailingProdScene extends AbstractScene {
  public toString(): string {
    return "TrailingProdScene";
  }

  public setup(): void {
    super.setup();
    this.repo.createChangeAndCommit("0");
    this.repo.createAndCheckoutBranch("prod");
    this.repo.createChangeAndCommit("prod", "prod");

    this.repo.checkoutBranch("main");
    this.repo.createChangeAndCommit("0.5", "0.5");

    execSync(`git -C ${this.dir} merge prod`);

    this.repo.checkoutBranch("main");
    this.repo.createChangeAndCommit("1", "1");
  }
}
