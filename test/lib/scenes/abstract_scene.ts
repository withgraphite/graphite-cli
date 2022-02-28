import { execSync } from 'child_process';
import fs from 'fs-extra';
import tmp from 'tmp';
import { initContext, TContext } from '../../../src/lib/context/context';
import { GitRepo } from '../../../src/lib/utils/git_repo';

export abstract class AbstractScene {
  tmpDir: tmp.DirResult;
  repo: GitRepo;
  dir: string;
  oldDir = execSync('pwd').toString().trim();
  context: TContext;

  constructor() {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: 'main' }, null, 2)
    );
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_user_config`,
      JSON.stringify({}, null, 2)
    );
    process.chdir(this.dir);
    this.context = initContext();
  }

  abstract toString(): string;

  public setup(): void {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: 'main' }, null, 2)
    );
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_user_config`,
      JSON.stringify({}, null, 2)
    );
    process.chdir(this.dir);
    this.context = initContext();
  }

  public cleanup(): void {
    process.chdir(this.oldDir);
    if (!process.env.DEBUG) {
      fs.emptyDirSync(this.dir);
      this.tmpDir.removeCallback();
    }
  }
}
