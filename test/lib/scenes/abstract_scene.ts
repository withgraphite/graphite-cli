import fs from 'fs-extra';
import tmp from 'tmp';
import { initContext, TContext } from '../../../src/lib/context';
import { cuteString } from '../../../src/lib/utils/cute_string';
import { GitRepo } from '../../../src/lib/utils/git_repo';

export abstract class AbstractScene {
  tmpDir: tmp.DirResult;
  repo: GitRepo;
  dir: string;
  oldDir: string;

  constructor() {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
    this.oldDir = process.cwd();
  }

  abstract toString(): string;

  public setup(): void {
    this.tmpDir = tmp.dirSync();
    this.dir = this.tmpDir.name;
    this.repo = new GitRepo(this.dir);
    fs.writeFileSync(
      `${this.dir}/.git/.graphite_repo_config`,
      cuteString({ trunk: 'main' })
    );
    const userConfigPath = `${this.dir}/.git/.graphite_user_config`;
    fs.writeFileSync(userConfigPath, cuteString({ tips: false }));
    process.env.GRAPHITE_USER_CONFIG_PATH = userConfigPath;
    this.oldDir = process.cwd();
    process.chdir(this.dir);
  }

  public cleanup(): void {
    process.chdir(this.oldDir);
    if (!process.env.DEBUG) {
      fs.emptyDirSync(this.dir);
      this.tmpDir.removeCallback();
    }
  }

  public getContext(): TContext {
    const oldDir = process.cwd();
    process.chdir(this.tmpDir.name);
    const context = initContext({
      globalArguments: {
        interactive: false,
        quiet: !!process.env.DEBUG,
        debug: !!process.env.DEBUG,
        verify: false,
      },
    });
    process.chdir(oldDir);
    return context;
  }
}
