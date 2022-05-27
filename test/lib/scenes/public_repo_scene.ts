import { execSync } from 'child_process';
import fs from 'fs-extra';
import tmp from 'tmp';
import { cuteString } from '../../../src/lib/utils/cute_string';
import { GitRepo } from '../../../src/lib/utils/git_repo';
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
    this.context.splog.logDebug(`Cloning...`);
    this.repo = new GitRepo(this.dir, { repoUrl: this.repoUrl });
    this.context.splog.logDebug(`Fetching branches...`);
    execSync(`git -C ${this.dir} fetch --all`);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      cuteString({ trunk: 'master' })
    );
    process.chdir(this.dir);
    this.context.splog.logDebug(`Dir: ${this.dir}`);
    this.repo.createChangeAndCommit('1', '1');
  }
}
