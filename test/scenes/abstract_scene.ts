import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import { GitRepo } from "../../src/lib/utils";

export abstract class AbstractScene {
  tmpDir: tmp.DirResult;
  repo: GitRepo;
  dir: string;
  oldDir = execSync("pwd").toString().trim();

  constructor() {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
  }

  abstract toString(): string;

  public setup(): void {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: "main" }, null, 2)
    );
    process.chdir(this.dir);
    if (process.env.DEBUG) {
      console.log(`Dir: ${this.dir}`);
    }
  }

  public cleanup(): void {
    process.chdir(this.oldDir);
    if (!process.env.DEBUG) {
      fs.emptyDirSync(this.dir);
      this.tmpDir.removeCallback();
    }
  }
}
