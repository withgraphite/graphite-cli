import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import { GitRepo } from "../../../src/lib/utils";
import { AbstractScene } from "./abstract_scene";

export class LargeScene extends AbstractScene {
  public toString(): string {
    return "LargeScene";
  }
  public setup(): void {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir, false);
    execSync(`git clone https://github.com/dagster-io/dagster.git ${this.dir}`);
    execSync(
      `git branch -r | grep -v '\\->' | while read remote; do git branch --track "\${remote#origin/}" "$remote"; done`,
      { cwd: this.dir }
    );
    execSync(`git -C ${this.dir} fetch --all`);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: "master" }, null, 2)
    );
    process.chdir(this.dir);
    if (process.env.DEBUG) {
      console.log(`Dir: ${this.dir}`);
    }
    this.repo.createChangeAndCommit("1", "1");
  }
}
