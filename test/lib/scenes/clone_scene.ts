import fs from 'fs-extra';
import tmp from 'tmp';
import { cuteString } from '../../../src/lib/utils/cute_string';
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
      cuteString({ trunk: 'main' })
    );
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_user_config`,
      cuteString({ experimental: true })
    );

    process.chdir(this.dir);
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
