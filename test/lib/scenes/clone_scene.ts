import fs from 'fs-extra';
import tmp from 'tmp';
import { initContext } from '../../../src/lib/context';
import { GitRepo } from '../../../src/lib/utils/git_repo';
import { AbstractScene } from './abstract_scene';

export class CloneScene extends AbstractScene {
  originTmpDir!: tmp.DirResult;
  originDir!: string;
  originRepo!: GitRepo;

  public toString(): string {
    return 'CloneScene';
  }

  public setup(): void {
    super.setup();
    this.repo.createChangeAndCommit('1', '1');
    [this.originDir, this.originRepo, this.originTmpDir] = [
      this.dir,
      this.repo,
      this.tmpDir,
    ];

    this.dir = tmp.dirSync().name;
    this.repo = new GitRepo(this.dir, { repoUrl: this.originDir });
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      JSON.stringify({ trunk: 'main' }, null, 2)
    );
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_user_config`,
      JSON.stringify({ experimental: true }, null, 2)
    );

    process.chdir(this.dir);
    this.context = initContext({
      userConfigOverride: `${this.dir}/.git/.graphite_user_config`,
    });
  }

  public cleanup(): void {
    process.chdir(this.oldDir);
    if (!process.env.DEBUG) {
      fs.emptyDirSync(this.originDir);
      fs.emptyDirSync(this.dir);
      this.tmpDir.removeCallback();
      this.originTmpDir.removeCallback();
    }
  }
}
