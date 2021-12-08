import { execSync } from 'child_process';
import fs from 'fs-extra';
import tmp from 'tmp';
import { GitRepo } from '../../../src/lib/utils';
import { AbstractScene } from './abstract_scene';

export class PublicRepoScene extends AbstractScene {
  repoUrl: string;
  name: string;
  timeout: number;

  constructor(opts: { repoUrl: string; name: string; timeout: number }) {
    super();
    this.repoUrl = opts.repoUrl;
    this.name = opts.name;
    this.timeout = opts.timeout;
  }

  public toString(): string {
    return this.name;
  }
  public setup(): void {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    console.log(`Cloning...`);
    this.repo = new GitRepo(this.dir, { repoUrl: this.repoUrl });
    console.log(`Fetching branches...`);
    execSync(`git -C ${this.dir} fetch --all`);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: 'master' }, null, 2)
    );
    process.chdir(this.dir);
    if (process.env.DEBUG) {
      console.log(`Dir: ${this.dir}`);
    }
    this.repo.createChangeAndCommit('1', '1');
  }
}
