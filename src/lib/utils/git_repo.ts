import fs from 'fs-extra';
import path from 'path';
import { USER_CONFIG_OVERRIDE_ENV } from '../context';
import { rebaseInProgress } from '../git/rebase_in_progress';
import { gpExecSync, gpExecSyncAndSplitLines } from './exec_sync';

const TEXT_FILE_NAME = 'test.txt';
export class GitRepo {
  dir: string;
  userConfigPath: string;
  constructor(
    dir: string,
    opts?: { existingRepo?: boolean; repoUrl?: string }
  ) {
    this.dir = dir;
    this.userConfigPath = path.join(dir, '.git/.graphite_user_config');
    if (opts?.existingRepo) {
      return;
    }
    if (opts?.repoUrl) {
      gpExecSync({
        command: `git clone ${opts.repoUrl} ${dir}`,
        onError: 'throw',
      });
    } else {
      gpExecSync({
        command: `git init ${dir} -b main`,
        onError: 'throw',
      });
    }
  }

  execCliCommand(command: string, opts?: { cwd?: string }): void {
    gpExecSync({
      command: [
        `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
        `NODE_ENV=development`,
        `node ${__dirname}/../../../../dist/src/index.js ${command}`,
      ].join(' '),
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
        cwd: opts?.cwd || this.dir,
      },
      onError: 'throw',
    });
  }

  execGitCommand(command: string, opts?: { cwd?: string }): void {
    gpExecSync({
      command: `git ${command}`,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
        cwd: opts?.cwd || this.dir,
      },
      onError: 'ignore',
    });
  }

  execCliCommandAndGetOutput(command: string): string {
    return gpExecSync({
      command: [
        `${USER_CONFIG_OVERRIDE_ENV}=${this.userConfigPath}`,
        `NODE_ENV=development`,
        `node ${__dirname}/../../../../dist/src/index.js ${command}`,
      ].join(' '),
      options: {
        cwd: this.dir,
      },
      onError: 'ignore',
    });
  }

  createChange(textValue: string, prefix?: string, unstaged?: boolean): void {
    const filePath = `${this.dir}/${
      prefix ? prefix + '_' : ''
    }${TEXT_FILE_NAME}`;
    fs.writeFileSync(filePath, textValue);
    if (!unstaged) {
      gpExecSync({
        command: `git -C "${this.dir}" add ${filePath}`,
        onError: 'throw',
      });
    }
  }

  createChangeAndCommit(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    gpExecSync({ command: `git -C "${this.dir}" add .`, onError: 'throw' });
    gpExecSync({
      command: `git -C "${this.dir}" commit -m "${textValue}"`,
      onError: 'throw',
    });
  }

  createChangeAndAmend(textValue: string, prefix?: string): void {
    this.createChange(textValue, prefix);
    gpExecSync({ command: `git -C "${this.dir}" add .`, onError: 'throw' });
    gpExecSync({
      command: `git -C "${this.dir}" commit --amend --no-edit`,
      onError: 'throw',
    });
  }

  deleteBranch(name: string): void {
    gpExecSync({
      command: `git -C "${this.dir}" branch -D ${name}`,
      onError: 'throw',
    });
  }

  createPrecommitHook(contents: string): void {
    fs.mkdirpSync(`${this.dir}/.git/hooks`);
    fs.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
    gpExecSync({
      command: `chmod +x ${this.dir}/.git/hooks/pre-commit`,
      onError: 'throw',
    });
  }

  createAndCheckoutBranch(name: string): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout -b "${name}"`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
      onError: 'throw',
    });
  }

  checkoutBranch(name: string): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout "${name}"`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
      onError: 'throw',
    });
  }

  rebaseInProgress(): boolean {
    return rebaseInProgress({ dir: this.dir });
  }

  resolveMergeConflicts(): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout --theirs .`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
      onError: 'throw',
    });
  }

  markMergeConflictsAsResolved(): void {
    gpExecSync({
      command: `git -C "${this.dir}" add .`,
      options: { stdio: process.env.DEBUG ? 'inherit' : 'ignore' },
      onError: 'throw',
    });
  }

  currentBranchName(): string {
    return gpExecSync({
      command: `git -C "${this.dir}" branch --show-current`,
      onError: 'ignore',
    });
  }

  getRef(refName: string): string {
    return gpExecSync({
      command: `git -C "${this.dir}" show-ref -s ${refName}`,
      onError: 'ignore',
    });
  }

  listCurrentBranchCommitMessages(): string[] {
    return gpExecSyncAndSplitLines({
      command: `git -C "${this.dir}" log --oneline  --format=%B`,
      onError: 'ignore',
    });
  }

  mergeBranch(args: { branch: string; mergeIn: string }): void {
    gpExecSync({
      command: `git -C "${this.dir}" checkout ${args.branch}; git merge ${args.mergeIn}`,
      options: {
        stdio: process.env.DEBUG ? 'inherit' : 'ignore',
      },
      onError: 'throw',
    });
  }
}
