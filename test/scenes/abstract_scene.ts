import { execSync } from "child_process";
import fs from "fs-extra";
import tmp from "tmp";
import GitRepo from "../utils/git_repo";

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
